import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Col, Row } from "react-bootstrap";

import { fetchTimeSeries, lookupStock } from "../api/TwelveData.jsx";
import { syncPricesForSymbol } from "../helpers/DailyPriceUpdater.js";
import {
  calcStats,
  calcAnalysis,
  normalizeDaysArg,
  isRangeRequest,
  resolveDays,
  planWarn,
} from "../helpers/tradingOrchestrator.js";

import {
  applyCashDelta,
  ensureSym,
  findSym,
  loadDbSeries,
  loadDbStatus,
  loadOwned,
  makeDbQuote,
} from "../helpers/tradingRepo.js";

import TradeActionModal from "../components/TradeActionModal.jsx";
import AnalysisCard from "../components/AnalysisCard.jsx";
import StockCard from "../components/StockCard.jsx";

const BASE_API = "http://localhost:3000/api/sql/sqlite.finance";
const USER_ID = 1;

// -------------------------------
// Orchestrator hook
// -------------------------------
export const useTradeOrchestrator = () => {
  const computeStats = (seriesAsc) => calcStats(seriesAsc || []);
  const computeAnalysis = (seriesAsc) => calcAnalysis(seriesAsc || []);

  // -------------------------------
  // State
  // -------------------------------
  const [symbol, setSymbol] = useState("");
  const [rangeDays, setRangeDays] = useState(30);

  const [quote, setQuote] = useState(null);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const [isTracked, setIsTracked] = useState(false);
  const [canSell, setCanSell] = useState(false);

  const [shares, setShares] = useState("");

  const [plan, setPlan] = useState("");
  const [buyBelow, setBuyBelow] = useState("");
  const [sellAbove, setSellAbove] = useState("");

  const [confirm, setConfirm] = useState({
    show: false,
    action: null,
    warning: "",
    phase: "confirm",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [symCache, setSymCache] = useState({
    upper: null,
    row: null,
    tracked: false,
    canSell: false,
  });

  const inFlightRef = useRef(false);

  // -------------------------------
  // Shell
  // -------------------------------
  const state = {
    symbol,
    rangeDays,

    quote,
    series,
    stats,
    analysis,

    isTracked,
    canSell,

    shares,

    plan,
    buyBelow,
    sellAbove,

    confirm,
    loading,
    submitting,
    error,
  };

  // -------------------------------
  // Helpers (hook-scope)
  // -------------------------------
  const applyData = (q, s) => {
    setQuote(q);
    setSeries(s);
    setStats(computeStats(s));
    setAnalysis(computeAnalysis(s));
  };

  const openConfirm = async (action) => {
    try {
      setError(null);

      const sym = symbol.trim();
      if (!sym) return setError("Please enter a symbol first");
      if (!quote) return setError("Please load a quote first (click Quote).");

      const n = Number(shares);
      if (!Number.isFinite(n) || n < 1) {
        return setError("Vul een geldig aantal aandelen in (minimaal 1).");
      }

      if (action === "SELL") {
        const row = await findSym(BASE_API, sym.toUpperCase());
        if (!row) return setError("Je hebt dit aandeel nog niet in je portfolio.");

        const owned = await loadOwned(BASE_API, USER_ID, row.id);

        if (owned <= 0) {
          return setError("Je hebt geen aandelen om te verkopen.");
        }

        if (n > owned) {
          setConfirm({
            show: true,
            action: null,
            warning: `Je kunt niet ${n} aandelen verkopen; je hebt er maar ${owned}.`,
            phase: "confirm",
          });
          return;
        }
      }

      setConfirm({
        show: true,
        action,
        warning: planWarn({
          action,
          price: quote?.price,
          buyBelow,
          sellAbove,
        }),
        phase: "confirm",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to open confirmation");
    }
  };

  const confirmAction = async () => {
    try {
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setSubmitting(true);

      setError(null);

      const sym = symbol.trim();
      const upper = sym.toUpperCase();

      const n = Number(shares);
      if (!Number.isFinite(n) || n < 1) {
        setError("Vul een geldig aantal aandelen in (minimaal 1).");
        return false;
      }

      const row = await ensureSym(BASE_API, upper, quote, { active: true });
      const signed = confirm.action === "SELL" ? -n : n;

      const payload = {
        user_id: USER_ID,
        symbol_id: row.id,
        shares: signed,
        price: Number(quote?.price) || null,
      };

      const res = await fetch(`${BASE_API}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(
          `DB ${String(confirm.action).toLowerCase()} failed: ${res.status} ${txt}`
        );
      }

      await applyCashDelta(BASE_API, { userId: USER_ID, shares: signed, price: payload.price });

      await syncPricesForSymbol(row).catch(console.error);

      setConfirm({ show: false, action: null, warning: "", phase: "confirm" });
      setShares("");

      const st = await loadDbStatus(BASE_API, USER_ID, upper);
      setSymCache({
        upper,
        row: st.row,
        tracked: st.tracked,
        canSell: st.canSell,
      });

      await loadMarketData();
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Action failed");
      return false;
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  };

  const addToWatchlist = async () => {
    const sym = symbol.trim();
    if (!sym) return setError("Please enter a symbol first");
    if (!quote) return setError("Please load a quote first (click Quote).");

    setError(null);

    try {
      const upper = sym.toUpperCase();
      const row = await ensureSym(BASE_API, upper, quote, { active: true });

      const payload = { user_id: USER_ID, symbol_id: row.id };

      const res = await fetch(`${BASE_API}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        if (!String(txt).toLowerCase().includes("unique")) {
          throw new Error(`DB add watchlist failed: ${res.status} ${txt}`);
        }
      }

      setIsTracked(true);
      setSymCache({ upper, row, tracked: true, canSell });

      await syncPricesForSymbol(row).catch(console.error);
      await loadMarketData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add to watchlist");
    }
  };

  const changeSymbol = (value) => {
    setSymbol(value);

    setQuote(null);
    setSeries([]);
    setStats(null);
    setAnalysis(null);

    setShares("");
    setConfirm({ show: false, action: null, warning: "", phase: "confirm" });

    setSymCache({ upper: null, row: null, tracked: false, canSell: false });
  };

  const savePlan = (txt, bb, sa) => {
    setPlan(txt);
    setBuyBelow(bb);
    setSellAbove(sa);
  };

  // -------------------------------
  // Market data load
  // -------------------------------
  const loadMarketData = async (daysArg = null) => {
    daysArg = normalizeDaysArg(daysArg);
    const isRange = isRangeRequest(daysArg);

    const sym = symbol.trim();
    if (!sym) {
      setError("Please enter a symbol");
      setQuote(null);
      setSeries(null);
      setStats(null);
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    if (!isRange) {
      setShares("");
      setConfirm({ show: false, action: null, warning: "", phase: "confirm" });
    }

    try {
      const upper = sym.toUpperCase();

      let row = null;
      let tracked = false;
      let sell = false;

      if (isRange && symCache.upper === upper) {
        row = symCache.row;
        tracked = symCache.tracked;
        sell = symCache.canSell;
      } else {
        const st = await loadDbStatus(BASE_API, USER_ID, upper);
        row = st.row;
        tracked = st.tracked;
        sell = st.canSell;

        setSymCache({ upper, row, tracked, canSell: sell });
      }

      setIsTracked(tracked);
      setCanSell(sell);

      if (!tracked || !isRange) {
        setRangeDays(30);
      }

      const days = isRange ? resolveDays({ tracked, daysArg, rangeDays }) : 30;

      if (tracked) {
        const serAsc = await loadDbSeries(BASE_API, row.id, days);

        if (!Array.isArray(serAsc) || serAsc.length === 0) {
          throw new Error("Geen daily_prices in DB voor dit symbool. (Sync nodig?)");
        }

        applyData(makeDbQuote(row, serAsc), serAsc);
        return;
      }

      const [qRes, sRes] = await Promise.all([
        lookupStock(sym),
        fetchTimeSeries(sym, days),
      ]);

      applyData(qRes, sRes);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Public API
  // -------------------------------
  const actions = {
    changeSymbol,
    setRangeDays,

    loadMarketData,

    addToWatchlist,

    openConfirm,
    confirmAction,

    savePlan,

    setShares,
    setConfirm,

    setPlan,
    setBuyBelow,
    setSellAbove,
  };

  return { state, actions };
};

// -------------------------------
// Page
// -------------------------------
const Trading = () => {
  const { state, actions } = useTradeOrchestrator();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingSymbol, setPendingSymbol] = useState(null);

  // -------------------------------
  // State
  // -------------------------------
  const {
    symbol,
    rangeDays,

    quote,
    series,
    stats,
    analysis,

    isTracked,
    canSell,

    shares,

    plan,
    buyBelow,
    sellAbove,

    confirm,
    loading,
    submitting,
    error,
  } = state;

  const { setConfirm, setRangeDays, setShares } = actions;

  const marketDataAvailable = quote != null;

  const seriesForChart = useMemo(() => {
    if (!Array.isArray(series) || series.length === 0) return series;
    return isTracked ? [...series].reverse() : series;
  }, [series, isTracked]);

  const closeConfirm = () =>
    setConfirm({ show: false, action: null, warning: "", phase: "confirm" });

  const handleConfirm = async () => {
    if (confirm.action === "WATCH") {
      closeConfirm();

      try {
        await actions.addToWatchlist();
      } catch (e) {
        console.error(e);
      }

      return;
    }

    const tradeAction = confirm.action;

    const ok = await actions.confirmAction();
    if (ok) {
      setConfirm({
        show: true,
        action: tradeAction,
        warning: "",
        phase: "success",
      });
    }
  };

  // -------------------------------
  // Effects
  // -------------------------------
  useEffect(() => {
    const nextSymbol = location.state?.symbol;

    if (!nextSymbol) return;
    if (nextSymbol === symbol) return;

    setPendingSymbol(nextSymbol);
    actions.changeSymbol(nextSymbol);
  }, [location.state, actions, symbol]);

  useEffect(() => {
    if (!pendingSymbol) return;
    if (symbol !== pendingSymbol) return;

    actions.loadMarketData();
    setPendingSymbol(null);
  }, [pendingSymbol, symbol, actions]);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <>
      <Row>
        <Col md={6}>
          <AnalysisCard
            symbol={symbol}
            onSymbolChange={actions.changeSymbol}
            onQuote={() => actions.loadMarketData()}
            loading={loading}
            hasQuote={marketDataAvailable}
            isTracked={isTracked}
            canSell={canSell}
            rangeDays={rangeDays}
            onRangeDaysChange={(d) => {
              if (d === rangeDays) return;
              setRangeDays(d);
              if (symbol.trim()) actions.loadMarketData(d);
            }}
            shares={shares}
            onSharesChange={setShares}
            analysis={analysis}
            plan={plan}
            buyBelow={buyBelow}
            sellAbove={sellAbove}
            onSavePlan={actions.savePlan}
            onWatch={() =>
              setConfirm({ show: true, action: "WATCH", warning: "", phase: "confirm" })
            }
            onBuy={() => actions.openConfirm("BUY")}
            onSell={() => actions.openConfirm("SELL")}
          />

          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !marketDataAvailable && <Alert variant="info">Loading...</Alert>}
        </Col>

        <Col md={6}>
          {quote && (
            <StockCard
              symbol={quote.symbol}
              name={quote.name}
              price={quote.price}
              currency={quote.currency}
              exchange={quote.exchange}
              change={stats?.change}
              changePercent={stats?.changePercent}
              stats={stats}
              series={seriesForChart}
              analysis={analysis}
            />
          )}
        </Col>
      </Row>

      <TradeActionModal
        // Context
        symbol={symbol}
        // Data
        action={confirm.action}
        warning={confirm.warning}
        shares={shares}
        phase={confirm.phase}
        // Flags
        show={confirm.show}
        submitting={submitting}
        // UI
        onCancel={() =>
          setConfirm({ show: false, action: null, warning: "", phase: "confirm" })
        }
        onConfirm={handleConfirm}
        onContinue={closeConfirm}
        onViewPortfolio={() => {
          closeConfirm();
          navigate("/portfolio");
        }}
      />
    </>
  );
};

export default Trading;
