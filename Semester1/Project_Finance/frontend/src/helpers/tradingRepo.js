export async function dbGet(url, errPrefix) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${errPrefix}: ${res.status}`);
  return await res.json();
}

// --- users (cash) -----------------------------------------------------------

export async function getUserById(baseApi, userId) {
  return await dbGet(`${baseApi}/users/${userId}`, "DB users error");
}

export async function updateUserById(baseApi, userId, user) {
  const res = await fetch(`${baseApi}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DB users update failed: ${res.status} ${txt}`);
  }

  try {
    return await res.json();
  } catch {
    return user;
  }
}

/**
 * Apply cash delta after a transaction is recorded.
 * shares: +n for BUY, -n for SELL
 * price: number
 *
 * Formula:
 *   cash = cash - (shares * price)
 * BUY  (shares > 0) => cash decreases
 * SELL (shares < 0) => cash increases
 */
export async function applyCashDelta(baseApi, { userId, shares, price }) {
  const user = await getUserById(baseApi, userId);

  const currentCash = Number(user?.cash);
  if (!Number.isFinite(currentCash)) throw new Error("User cash is not a number");

  const s = Number(shares);
  const p = Number(price);

  if (!Number.isFinite(s) || !Number.isFinite(p)) {
    throw new Error("Invalid shares/price for cash update");
  }

  const nextCash = currentCash - s * p;

  const nextUser = {
    id: user.id,
    username: user.username,
    hash: user.hash,
    cash: nextCash,
    twelvedata_key: user.twelvedata_key ?? null,
  };

  await updateUserById(baseApi, userId, nextUser);

  return nextCash;
}

// --- symbols ----------------------------------------------------------------

export async function findSym(baseApi, upper) {
  const q = String(upper || "").toUpperCase();

  // 1) Preferred: server-side search (if supported)
  try {
    const url = `${baseApi}/symbols/search?symbol=${encodeURIComponent(q)}`;
    const rows = await dbGet(url, "DB symbols error");
    if (Array.isArray(rows) && rows.length > 0) return rows[0];
  } catch {
    // ignore and fallback
  }

  // 2) Fallback: list + client filter
  const all = await dbGet(`${baseApi}/symbols`, "DB symbols error");
  const rows = Array.isArray(all) ? all : Array.isArray(all?.rows) ? all.rows : [];

  const hit = rows.find((r) => String(r?.symbol || "").toUpperCase() === q);
  return hit || null;
}

export async function saveSym(baseApi, row, patch) {
  const body = {
    symbol: row.symbol,
    name: row.name,
    region: row.region,
    exchange: row.exchange,
    currency: row.currency,
    is_active: row.is_active ?? 0,
    prices_updated_through: row.prices_updated_through
      ? String(row.prices_updated_through).slice(0, 10)
      : null,
    ...patch,
  };

  const res = await fetch(`${baseApi}/symbols/${row.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DB symbols update failed: ${res.status} ${txt}`);
  }

  try {
    return await res.json();
  } catch {
    return { ...row, ...patch };
  }
}

export async function ensureSym(baseApi, upper, quote, { active = false } = {}) {
  let row = await findSym(baseApi, upper);

  if (!row) {
    if (!quote) throw new Error("Quote ontbreekt (laad eerst een quote).");

    const payload = {
      symbol: upper,
      name: quote.name || upper,
      region: null,
      exchange: quote.exchange || null,
      currency: quote.currency || null,
      is_active: 0,
      prices_updated_through: null,
    };

    const res = await fetch(`${baseApi}/symbols`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`DB create symbol failed: ${res.status} ${txt}`);
    }

    row = await res.json();
  }

  if (active && Number(row.is_active) !== 1) {
    row = await saveSym(baseApi, row, { is_active: 1 });
  }

  return row;
}

// --- status (watchlist + portfolio) -----------------------------------------

export async function loadOwned(baseApi, userId, symId) {
  const url = `${baseApi}/transactions/search?user_id=${userId}&symbol_id=${symId}`;
  const rows = await dbGet(url, "DB transactions error");

  const owned = Array.isArray(rows)
    ? rows.reduce((sum, t) => sum + Number(t.shares || 0), 0)
    : 0;

  return owned;
}

// ✅ renamed + preferred: loadDbStatus
export async function loadDbStatus(baseApi, userId, upper) {
  const row = await findSym(baseApi, upper);

  let tracked = false;
  let canSell = false;

  if (row) {
    const wUrl = `${baseApi}/watchlist/search?user_id=${userId}&symbol_id=${row.id}`;
    const wRows = await dbGet(wUrl, "DB watchlist error");
    const inWatch = Array.isArray(wRows) && wRows.length > 0;

    const owned = await loadOwned(baseApi, userId, row.id);
    const inPort = owned !== 0;

    canSell = owned > 0;
    tracked = inWatch || inPort;
  }

  return { row, tracked, canSell };
}

// --- daily_prices series ----------------------------------------------------

const isoDay = (d) => d.toISOString().slice(0, 10);

const rangeStart = (days) => {
  const n = Number(days);
  const safe = Number.isFinite(n) && n > 0 ? n : 30;
  const d = new Date();
  d.setDate(d.getDate() - safe);
  return isoDay(d);
};

const rangeLimit = (days) => {
  const d = Number(days);
  if (d <= 30) return 80;
  if (d <= 100) return 180;
  if (d <= 365) return 450;
  return 600;
};

const mapDbSeries = (rows) => {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      datetime: String(r.date || r.datetime || "").slice(0, 10),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
    }))
    .filter((c) => c.datetime && Number.isFinite(c.close))
    .sort((a, b) => (a.datetime > b.datetime ? 1 : a.datetime < b.datetime ? -1 : 0));
};

const filterDays = (serAsc, days) => {
  if (!Array.isArray(serAsc) || serAsc.length === 0) return [];
  const start = rangeStart(days);
  return serAsc.filter((c) => c.datetime >= start);
};

// ✅ renamed + preferred: loadDbSeries
export async function loadDbSeries(baseApi, symId, days) {
  const start = rangeStart(days);
  const limit = rangeLimit(days);

  const url =
    `${baseApi}/daily_prices/search` +
    `?symbol_id=${encodeURIComponent(symId)}` +
    `&date_gte=${encodeURIComponent(start)}` +
    `&limit=${encodeURIComponent(limit)}`;

  const res = await fetch(url);

  if (res.ok) {
    const rows = await res.json();
    const serAsc = mapDbSeries(rows);
    if (serAsc.length > 0) return serAsc;
  }

  // fallback (ruimer + client filter)
  const fbLimit = 650;
  const fbUrl =
    `${baseApi}/daily_prices/search` +
    `?symbol_id=${encodeURIComponent(symId)}` +
    `&limit=${encodeURIComponent(fbLimit)}`;

  const fbRows = await dbGet(fbUrl, "DB daily_prices error");
  const allAsc = mapDbSeries(fbRows);

  const fil = filterDays(allAsc, days);
  return fil.length > 0 ? fil : allAsc;
}

// --- quote mapping ----------------------------------------------------------

export function makeDbQuote(row, serAsc) {
  const last = Array.isArray(serAsc) && serAsc.length > 0 ? serAsc[serAsc.length - 1] : null;
  return {
    symbol: row.symbol,
    name: row.name || row.symbol,
    exchange: row.exchange || null,
    currency: row.currency || null,
    price: last ? last.close : null,
  };
}
