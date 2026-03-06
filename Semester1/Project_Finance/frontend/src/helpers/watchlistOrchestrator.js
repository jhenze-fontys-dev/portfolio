import { useCallback, useMemo, useState } from "react";

const BASE_API = "http://localhost:3000/api/sql/sqlite.finance";
const USER_ID = 1;

// -------------------------------
// Helpers (module-scope)
// -------------------------------
const unwrapRows = (json) => {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.rows)) return json.rows;
  return [];
};

const buildSymbolById = (symbols) => {
  const map = new Map();
  (symbols || []).forEach((s) => {
    if (s?.id == null) return;
    map.set(Number(s.id), s);
  });
  return map;
};

const mapDailyPricesAsc = (rows) => {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      date: String(r.date || r.datetime || "").slice(0, 10),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
    }))
    .filter((c) => c.date && Number.isFinite(c.close))
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
};

const loadLatestTwoDays = async (baseApi, symbolId) => {
  const limit = 800;
  const offset = 0;

  const url =
    `${baseApi}/daily_prices/search` +
    `?symbol_id=${encodeURIComponent(symbolId)}` +
    `&limit=${encodeURIComponent(limit)}` +
    `&offset=${encodeURIComponent(offset)}`;

  const res = await fetch(url);
  if (!res.ok) return { last: null, prev: null };

  const json = await res.json();
  const rows = unwrapRows(json);
  const asc = mapDailyPricesAsc(rows);

  if (asc.length === 0) return { last: null, prev: null };

  const last = asc[asc.length - 1];
  const prev = asc.length >= 2 ? asc[asc.length - 2] : null;

  return { last, prev };
};

const enrichWatchlistRows = async (baseApi, watchRows, symbolsById) => {
  const enriched = await Promise.all(
    (watchRows || []).map(async (w) => {
      const watchId = Number(w?.id);
      const symbolId = Number(w?.symbol_id);

      const sym = symbolsById.get(symbolId) || null;

      let stats = { open: null, high: null, low: null, close: null };
      let prevClose = null;

      if (Number.isFinite(symbolId)) {
        const { last, prev } = await loadLatestTwoDays(baseApi, symbolId);

        stats = {
          open: Number.isFinite(last?.open) ? last.open : null,
          high: Number.isFinite(last?.high) ? last.high : null,
          low: Number.isFinite(last?.low) ? last.low : null,
          close: Number.isFinite(last?.close) ? last.close : null,
        };

        prevClose = Number.isFinite(prev?.close) ? prev.close : null;
      }

      const close = stats.close;

      const change =
        Number.isFinite(close) && Number.isFinite(prevClose)
          ? close - prevClose
          : null;

      const changePercent =
        Number.isFinite(change) && Number.isFinite(prevClose) && prevClose !== 0
          ? (change / prevClose) * 100
          : null;

      return {
        watchId,
        symbolId,

        symbol: sym?.symbol || null,
        name: sym?.name || null,
        exchange: sym?.exchange || null,
        currency: sym?.currency || null,

        stats,
        prevClose,
        change,
        changePercent,
      };
    })
  );

  // stable ordering: by symbol
  return enriched.sort((a, b) => String(a.symbol || "").localeCompare(String(b.symbol || "")));
};

// -------------------------------
// Orchestrator hook
// -------------------------------
export const useWatchlistOrchestrator = () => {
  // -------------------------------
  // Data
  // -------------------------------
  const [rows, setRows] = useState([]);

  // -------------------------------
  // Flags
  // -------------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------------
  // Actions
  // -------------------------------
  const loadWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [wRes, sRes] = await Promise.all([
        fetch(`${BASE_API}/watchlist/search?user_id=${USER_ID}`),
        fetch(`${BASE_API}/symbols`),
      ]);

      if (!wRes.ok) {
        const txt = await wRes.text();
        throw new Error(`Failed to load watchlist (${wRes.status}) ${txt}`);
      }

      if (!sRes.ok) {
        const txt = await sRes.text();
        throw new Error(`Failed to load symbols (${sRes.status}) ${txt}`);
      }

      const wJson = await wRes.json();
      const sJson = await sRes.json();

      const watchRows = unwrapRows(wJson);
      const symbols = unwrapRows(sJson);

      const symbolsById = buildSymbolById(symbols);
      const next = await enrichWatchlistRows(BASE_API, watchRows, symbolsById);

      setRows(next);
      return true;
    } catch (e) {
      setError(e?.message || "Failed to load watchlist");
      setRows([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromWatchlist = useCallback(async (watchId) => {
    const res = await fetch(`${BASE_API}/watchlist/${watchId}`, { method: "DELETE" });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed to remove watchlist item (${res.status}) ${txt}`);
    }
    return true;
  }, []);

  // -------------------------------
  // Public API
  // -------------------------------
  const state = useMemo(
    () => ({
      rows,
      loading,
      error,
    }),
    [rows, loading, error]
  );

  const actions = useMemo(
    () => ({
      loadWatchlist,
      removeFromWatchlist,
    }),
    [loadWatchlist, removeFromWatchlist]
  );

  return { state, actions };
};
