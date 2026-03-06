// frontend/src/helpers/DailyPriceUpdater.js

const BASE_API = "http://localhost:3000/api/sql/sqlite.finance";
const TD_BASE = "https://api.twelvedata.com";
const TD_KEY =
  import.meta.env.VITE_TWELVE_DATA_KEY || import.meta.env.VITE_TWELVEDATA_KEY;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isoToday = () => new Date().toISOString().slice(0, 10);

// -------------------- date utils --------------------
const addDaysISO = (iso, days) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

const daysBetweenISO = (a, b) => {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.max(0, Math.ceil((db - da) / (1000 * 60 * 60 * 24)));
};

const normalizeNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// outputsize kiezen op basis van hoe ver "fromDate" terug ligt.
// Daily candles: ~252/jaar, ~520/2 jaar. Cap ~600.
const pickOutputSize = (fromDate) => {
  const today = isoToday();
  const missing = daysBetweenISO(fromDate, today);
  const buffer = 14;
  const want = missing + buffer;

  if (missing > 400) return 600;
  return Math.max(30, Math.min(600, want));
};

// -------------------- resume helpers (same day only) --------------------
const RESUME_KEY = "pricesSync:resume";

function loadResume(today) {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.day !== today) return null;
    if (!Array.isArray(data.queue) || typeof data.i !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

function saveResume(data) {
  localStorage.setItem(RESUME_KEY, JSON.stringify(data));
}

function clearResume() {
  localStorage.removeItem(RESUME_KEY);
}

// -------------------- API helpers --------------------
async function fetchActiveSymbols() {
  // try search endpoint
  try {
    const res = await fetch(`${BASE_API}/symbols/search?is_active=1`);
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows)) return rows;
    }
  } catch {
    // ignore
  }

  // fallback: list + filter
  const res = await fetch(`${BASE_API}/symbols`);
  if (!res.ok) throw new Error(`symbols list failed: ${res.status}`);
  const all = await res.json();
  return (Array.isArray(all) ? all : []).filter((s) => Number(s.is_active) === 1);
}

/**
 * Fetch all daily_prices for a symbol (paged) and return the max date (YYYY-MM-DD) or null.
 * This is our robust "cursor" source of truth (independent from prices_updated_through).
 */
async function fetchMaxDailyPriceDate(symbolId, { pageSize = 1000 } = {}) {
  let offset = 0;
  let maxDate = null;

  while (true) {
    const url =
      `${BASE_API}/daily_prices/search?symbol_id=${encodeURIComponent(symbolId)}` +
      `&limit=${pageSize}&offset=${offset}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`daily_prices search failed: ${res.status}`);

    const rows = await res.json();
    const list = Array.isArray(rows) ? rows : [];

    for (const r of list) {
      const d = String(r?.date || "").slice(0, 10);
      if (d && (!maxDate || d > maxDate)) maxDate = d;
    }

    if (list.length < pageSize) break;
    offset += pageSize;

    // safety guard to avoid infinite loops in weird cases
    if (offset > 200_000) break;
  }

  return maxDate;
}

async function insertDailyPrice(payload) {
  const res = await fetch(`${BASE_API}/daily_prices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    const lower = String(txt).toLowerCase();

    // ✅ Treat conflicts as "already inserted"
    if (
      res.status === 409 ||
      lower.includes("already exists") ||
      lower.includes("unique constraint") ||
      lower.includes("unique constraint failed") ||
      (lower.includes("sqlite_constraint") && lower.includes("unique"))
    ) {
      return { inserted: false, ignored: true };
    }

    throw new Error(`daily_prices insert failed: ${res.status} ${txt}`);
  }

  return { inserted: true };
}

async function updateSymbolCursor(symbolRow, throughDate) {
  // Some generators require full body for PUT; send existing fields back.
  // NOTE: our backend expects integer IDs to be handled by sql.driver id coercion.
  const body = {
    id: symbolRow.id, // keep it explicit anyway

    symbol: symbolRow.symbol,
    name: symbolRow.name,
    region: symbolRow.region,
    exchange: symbolRow.exchange,
    currency: symbolRow.currency,
    is_active: symbolRow.is_active ?? 1,
    prices_updated_through: throughDate,
  };

  const res = await fetch(`${BASE_API}/symbols/${symbolRow.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`symbols PUT failed: ${res.status} ${txt}`);
  }
}

async function timeSeriesBatch(symbols, outputsize) {
  if (!TD_KEY) throw new Error("Missing VITE_TWELVE_DATA_KEY (set in .env)");

  const params = new URLSearchParams({
    symbol: symbols.join(","),
    interval: "1day",
    outputsize: String(outputsize),
    apikey: TD_KEY,
  });

  const url = `${TD_BASE}/time_series?${params.toString()}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

/**
 * batchJson:
 * { AAPL:{values:[...],status:"ok"}, MSFT:{...} }
 */
function parseBatch(batchJson, bySymbolRow) {
  const inserts = [];
  const maxBySymbol = new Map();

  for (const [sym, payload] of Object.entries(batchJson || {})) {
    if (!payload || payload.status !== "ok") continue;

    const row = bySymbolRow.get(sym);
    if (!row) continue;

    const values = Array.isArray(payload.values) ? payload.values : [];
    for (const c of values) {
      const date = String(c.datetime || "").slice(0, 10);
      if (!date) continue;

      inserts.push({
        symbolRow: row,
        candle: {
          date,
          open: normalizeNum(c.open),
          high: normalizeNum(c.high),
          low: normalizeNum(c.low),
          close: normalizeNum(c.close),
          volume: normalizeNum(c.volume),
        },
      });

      const prev = maxBySymbol.get(sym);
      if (!prev || date > prev) maxBySymbol.set(sym, date);
    }
  }

  return { inserts, maxBySymbol };
}

// -------------------- progress emitter --------------------
function makeEmitter({ onProgress, totalRef, doneRef, insertedRef }) {
  return (phase, extra = {}) => {
    if (!onProgress) return;

    const symbolsTotal = totalRef.value;
    const symbolsDone = doneRef.value;
    const percent = symbolsTotal > 0 ? Math.round((symbolsDone / symbolsTotal) * 100) : 0;

    onProgress({
      phase, // "fetching" | "inserting" | "waiting" | "done"
      batchIndex: extra.batchIndex ?? null,
      batchCount: extra.batchCount ?? null,
      symbolsDone,
      symbolsTotal,
      percent,
      nextRunInMs: extra.nextRunInMs ?? 0,
      insertedRows: insertedRef.value,

      // ✅ extra UI help
      batchSymbols: extra.batchSymbols ?? [],
    });
  };
}

// ---------------------------------------------------------
// Public API
// ---------------------------------------------------------

/**
 * Sync prices for ONE symbol (use at watchlist-add / first BUY).
 * - cursor source of truth: daily_prices max(date)
 * - if empty: backfill ~2 years
 * - else: incremental from lastDate+1 (regardless of symbol.prices_updated_through)
 */
export async function syncPricesForSymbol(symbolRow, { onProgress } = {}) {
  const today = isoToday();

  // 1) Determine last known date from daily_prices (true cursor)
  const lastInTable = await fetchMaxDailyPriceDate(symbolRow.id);
  const last = lastInTable ? String(lastInTable).slice(0, 10) : null;

  const fromDate = last ? addDaysISO(last, 1) : addDaysISO(today, -730);
  const outputsize = pickOutputSize(fromDate);

  const totalRef = { value: 1 };
  const doneRef = { value: 0 };
  const insertedRef = { value: 0 };
  const emit = makeEmitter({ onProgress, totalRef, doneRef, insertedRef });

  emit("fetching", { batchIndex: 1, batchCount: 1, batchSymbols: [symbolRow.symbol] });

  const batchJson = await timeSeriesBatch([symbolRow.symbol], outputsize);

  const normalizedBatchJson =
    batchJson && batchJson.status === "ok" && Array.isArray(batchJson.values)
      ? { [symbolRow.symbol]: batchJson }
      : batchJson;

  const bySymbolRow = new Map([[symbolRow.symbol, symbolRow]]);
  const { inserts, maxBySymbol } = parseBatch(normalizedBatchJson, bySymbolRow);

  emit("inserting", { batchIndex: 1, batchCount: 1, batchSymbols: [symbolRow.symbol] });

  for (const { candle } of inserts) {
    if (candle.date < fromDate) continue;

    const r = await insertDailyPrice({
      symbol_id: symbolRow.id,
      date: candle.date,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    });

    if (r?.inserted) insertedRef.value += 1;
  }

  const newThrough = maxBySymbol.get(symbolRow.symbol) || last || null;
  if (newThrough) {
    await updateSymbolCursor(symbolRow, newThrough);
  }

  doneRef.value = 1;
  emit("done", { batchIndex: 1, batchCount: 1, batchSymbols: [symbolRow.symbol] });

  return { insertedRows: insertedRef.value, through: newThrough };
}

/**
 * Sync daily prices for ALL active symbols (or a provided list).
 *
 * Features:
 * - batch requests (multi-symbol)
 * - dynamic batch size: uses remaining credits in current minute window
 * - progress callback for UI
 * - resume same day after refresh/return (queue + index in localStorage)
 *
 * creditsPerMinute: free plan ~8.
 */
export async function syncDailyPrices(
  symbols = null,
  {
    storageKey = "pricesSyncDay",
    force = false,
    creditsPerMinute = 8,
    onProgress,
  } = {},
) {
  const today = isoToday();
  const last = localStorage.getItem(storageKey);

  // If we completed today already, skip (unless force).
  if (!force && last === today) {
    return { skipped: true, reason: "already-synced-today" };
  }

  // Resume (same day only)
  const resume = loadResume(today);

  let queue;
  let iStart = 0;

  if (resume) {
    queue = resume.queue;
    iStart = resume.i || 0;
  } else {
    const list =
      Array.isArray(symbols) && symbols.length > 0 ? symbols : await fetchActiveSymbols();

    queue = (Array.isArray(list) ? list : [])
      .filter((s) => s?.id && s?.symbol && Number(s.is_active) === 1)
      .map((s) => ({
        ...s,
        prices_updated_through: s.prices_updated_through
          ? String(s.prices_updated_through).slice(0, 10)
          : null,
      }));

    saveResume({
      day: today,
      queue,
      i: 0,
      windowStart: Date.now(),
      creditsUsed: 0,
    });
  }

  const total = queue.length;
  if (total === 0) {
    localStorage.setItem(storageKey, today);
    clearResume();
    return { skipped: false, symbols: 0, insertedRows: 0 };
  }

  // Progress refs
  const totalRef = { value: total };
  const doneRef = { value: Math.min(iStart, total) };
  const insertedRef = { value: 0 };
  const emit = makeEmitter({ onProgress, totalRef, doneRef, insertedRef });

  // Credit window (resume-safe: if we have saved values, use them; else start fresh)
  let windowStart = resume?.windowStart ?? Date.now();
  let creditsUsed = resume?.creditsUsed ?? 0;

  // Estimate batches for display (rough; dynamic in reality)
  const batchCountEstimate = Math.ceil(total / creditsPerMinute);

  let batchIndex = 0;

  for (let i = iStart; i < queue.length; ) {
    const now = Date.now();
    const elapsed = now - windowStart;

    // Reset window every 60 seconds
    if (elapsed >= 60_000) {
      windowStart = now;
      creditsUsed = 0;
    }

    const creditsLeft = creditsPerMinute - creditsUsed;

    // No budget => wait until the window resets
    if (creditsLeft <= 0) {
      const waitMs = Math.max(0, 60_000 - elapsed);
      emit("waiting", {
        batchIndex,
        batchCount: batchCountEstimate,
        nextRunInMs: waitMs,
        batchSymbols: [],
      });
      await sleep(waitMs + 25);
      continue;
    }

    // Dynamic batch size: take as many as we can within remaining credits
    const remaining = queue.length - i;
    const take = Math.min(creditsLeft, remaining);

    const batch = queue.slice(i, i + take);
    const symStrings = batch.map((x) => x.symbol);

    // ✅ Determine per-symbol fromDate based on daily_prices max(date)
    const maxDates = await Promise.all(batch.map((row) => fetchMaxDailyPriceDate(row.id)));
    const fromDates = maxDates.map((maxDate) =>
      maxDate ? addDaysISO(String(maxDate).slice(0, 10), 1) : addDaysISO(today, -730),
    );

    // Choose outputsize based on oldest fromDate in this batch
    const oldestFrom = fromDates.reduce((min, d) => (!min || d < min ? d : min), null);
    const outputsize = pickOutputSize(oldestFrom);

    batchIndex += 1;
    emit("fetching", {
      batchIndex,
      batchCount: batchCountEstimate,
      batchSymbols: symStrings,
    });

    // 1) Fetch candles for batch
    const batchJson = await timeSeriesBatch(symStrings, outputsize);

    // 2) Parse
    const bySymbolRow = new Map(batch.map((x) => [x.symbol, x]));
    const { inserts, maxBySymbol } = parseBatch(batchJson, bySymbolRow);

    emit("inserting", {
      batchIndex,
      batchCount: batchCountEstimate,
      batchSymbols: symStrings,
    });

    // 3) Insert only missing range per symbol
    const fromBySymbol = new Map(batch.map((x, idx) => [x.symbol, fromDates[idx]]));

    for (const { symbolRow, candle } of inserts) {
      const fromDate = fromBySymbol.get(symbolRow.symbol);
      if (fromDate && candle.date < fromDate) continue;

      const r = await insertDailyPrice({
        symbol_id: symbolRow.id,
        date: candle.date,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      });

      if (r?.inserted) insertedRef.value += 1;
    }

    // 4) Update cursor per symbol (only if advanced)
    for (const row of batch) {
      const prev = row.prices_updated_through;
      const maxDate = maxBySymbol.get(row.symbol);

      if (maxDate && maxDate !== prev) {
        await updateSymbolCursor(row, maxDate);
        row.prices_updated_through = maxDate;
      }
    }

    // 5) Advance pointers + spend credits
    i += take;
    doneRef.value += take;
    creditsUsed += take;

    // Save resume state after each batch
    saveResume({
      day: today,
      queue,
      i,
      windowStart,
      creditsUsed,
    });
  }

  // Completed
  clearResume();
  localStorage.setItem(storageKey, today);

  emit("done", { batchIndex, batchCount: batchCountEstimate, batchSymbols: [] });

  return { skipped: false, symbols: total, insertedRows: insertedRef.value };
}
