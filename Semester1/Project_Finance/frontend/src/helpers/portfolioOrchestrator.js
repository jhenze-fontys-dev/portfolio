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

const buildSymbolMap = (symbols) => {
  const map = new Map();

  (symbols || []).forEach((row) => {
    const id = row?.id;
    const sym = row?.symbol;

    if (id == null) return;
    if (!sym) return;

    map.set(Number(id), String(sym).toUpperCase());
  });

  return map;
};

const buildSymbolInfoBySymbol = (symbols) => {
  const bySymbol = new Map();

  (symbols || []).forEach((row) => {
    const sym = row?.symbol;
    if (!sym) return;

    bySymbol.set(String(sym).toUpperCase(), row);
  });

  return bySymbol;
};

const aggregateHoldings = (transactions, idToSymbol) => {
  const bySymbol = new Map();

  (transactions || []).forEach((tx) => {
    const symbolId = Number(tx?.symbol_id);
    const symbol = idToSymbol.get(symbolId);
    if (!symbol) return;

    const shares = Number(tx?.shares);
    if (!Number.isFinite(shares)) return;

    const prev = bySymbol.get(symbol) || 0;
    bySymbol.set(symbol, prev + shares);
  });

  return Array.from(bySymbol.entries())
    .map(([symbol, shares]) => ({ symbol, shares }))
    .filter((row) => row.shares !== 0)
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
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


const computeSummary = (cash, rows) => {
  const safeCash = Number.isFinite(Number(cash)) ? Number(cash) : 0;

  let holdingsValue = 0;
  let prevHoldingsValue = 0;

  (rows || []).forEach((r) => {
    const shares = Number(r.shares);
    if (!Number.isFinite(shares)) return;

    const close = Number(r.stats?.close);
    const prevClose = Number(r.prevClose);

    if (Number.isFinite(close)) holdingsValue += shares * close;
    if (Number.isFinite(prevClose)) prevHoldingsValue += shares * prevClose;
  });

  const dayChangeValue = holdingsValue - prevHoldingsValue;

  const dayChangePercent =
    prevHoldingsValue > 0 ? (dayChangeValue / prevHoldingsValue) * 100 : null;

  const totalValue = safeCash + holdingsValue;

  return {
    cash: safeCash,
    holdingsValue,
    totalValue,
    dayChangeValue,
    dayChangePercent,
  };
};

const enrichRowsWithMarket = async (baseApi, holdings, symbols) => {
  const bySymbol = buildSymbolInfoBySymbol(symbols);

  const enriched = await Promise.all(
    (holdings || []).map(async (h) => {
      const sym = h.symbol;
      const info = bySymbol.get(sym) || null;

      const symbolId = info?.id != null ? Number(info.id) : null;

      let stats = { open: null, high: null, low: null, close: null };
      let prevClose = null;

      if (symbolId != null && Number.isFinite(symbolId)) {
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
        symbol: sym,
        name: info?.name || sym,
        exchange: info?.exchange || null,
        currency: info?.currency || null,

        stats,
        prevClose,
        change,
        changePercent,

        shares: h.shares,
      };
    })
  );

  return enriched.sort((a, b) => a.symbol.localeCompare(b.symbol));
};

const loadUserCash = async (baseApi, userId) => {
  // Assumption: API supports /users/search?id=...
  const url = `${baseApi}/users/search?id=${encodeURIComponent(userId)}`;

  const res = await fetch(url);
  if (!res.ok) return 0;

  const json = await res.json();
  const rows = unwrapRows(json);
  const user = rows[0] || null;

  return user?.cash ?? 0;
};

// -------------------------------
// Orchestrator hook
// -------------------------------
export const usePortfolioOrchestrator = () => {
  // -------------------------------
  // Context
  // -------------------------------

  // -------------------------------
  // Data
  // -------------------------------
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    cash: 0,
    holdingsValue: 0,
    totalValue: 0,
    dayChangeValue: 0,
    dayChangePercent: null,
  });

  // -------------------------------
  // Flags
  // -------------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------------
  // Inputs
  // -------------------------------

  // -------------------------------
  // Actions
  // -------------------------------
  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [txRes, symRes, cash] = await Promise.all([
        fetch(`${BASE_API}/transactions/search?user_id=${USER_ID}`),
        fetch(`${BASE_API}/symbols`),
        loadUserCash(BASE_API, USER_ID),
      ]);

      if (!txRes.ok) {
        const txt = await txRes.text();
        throw new Error(`Failed to load transactions (${txRes.status}) ${txt}`);
      }

      if (!symRes.ok) {
        const txt = await symRes.text();
        throw new Error(`Failed to load symbols (${symRes.status}) ${txt}`);
      }

      const txJson = await txRes.json();
      const symJson = await symRes.json();

      const transactions = unwrapRows(txJson);
      const symbols = unwrapRows(symJson);

      const idToSymbol = buildSymbolMap(symbols);
      const holdings = aggregateHoldings(transactions, idToSymbol);

      const nextRows = await enrichRowsWithMarket(BASE_API, holdings, symbols);
      const nextSummary = computeSummary(cash, nextRows);

      setRows(nextRows);
      setSummary(nextSummary);

      return true;
    } catch (e) {
      setError(e?.message || "Failed to load portfolio");
      setRows([]);
      setSummary({
        cash: 0,
        holdingsValue: 0,
        totalValue: 0,
        dayChangeValue: 0,
        dayChangePercent: null,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------------------
  // Public API
  // -------------------------------
  const state = useMemo(
    () => ({
      // Context

      // Data
      rows,
      summary,

      // Flags
      loading,
      error,

      // Inputs

      // UI
    }),
    [rows, summary, loading, error]
  );

  const actions = useMemo(
    () => ({
      loadPortfolio,
    }),
    [loadPortfolio]
  );

  return { state, actions };
};
