import {
  avgDailyMove,
  meanClose,
  periodHigh,
  periodLow,
  rangeHighLow,
} from "./analysis.js";

// -------------------------------
// Pure data helpers
// -------------------------------
export const calcStats = (ser) => {
  if (!Array.isArray(ser) || ser.length === 0) return null;

  const last = ser[ser.length - 1];
  const prev = ser.length > 1 ? ser[ser.length - 2] : null;

  let change = null;
  let changePercent = null;

  if (prev) {
    const cur = Number(last.close);
    const prv = Number(prev.close);
    if (Number.isFinite(cur) && Number.isFinite(prv)) {
      change = cur - prv;
      changePercent = prv ? (change / prv) * 100 : null;
    }
  }

  return {
    open: last.open,
    high: last.high,
    low: last.low,
    close: last.close,
    change,
    changePercent,
  };
};

export const calcAnalysis = (ser) => {
  if (!Array.isArray(ser) || ser.length === 0) return null;

  const vol = avgDailyMove(ser);

  return {
    avg: meanClose(ser),
    max: periodHigh(ser),
    min: periodLow(ser),
    range: rangeHighLow(ser),
    volatility: vol == null ? "—" : `${vol}%`,
  };
};

// -------------------------------
// Range / request helpers
// -------------------------------
export const normalizeDaysArg = (daysArg) => {
  if (daysArg && typeof daysArg === "object") return null;
  return daysArg ?? null;
};

export const isRangeRequest = (daysArg) => {
  const norm = normalizeDaysArg(daysArg);
  const daysNum = Number(norm);
  return norm !== null && Number.isFinite(daysNum);
};

export const resolveDays = ({ tracked, daysArg, rangeDays }) => {
  const daysNum = Number(daysArg);
  const hasDays = daysArg !== null && Number.isFinite(daysNum);

  if (!tracked) return 30;
  return hasDays ? daysNum : rangeDays;
};

// -------------------------------
// Plan helpers
// -------------------------------
export const planWarn = ({ action, price, buyBelow, sellAbove }) => {
  const cur = Number(price);
  if (!Number.isFinite(cur)) return "";

  if (action === "BUY" && buyBelow) {
    const bb = Number(buyBelow);
    if (Number.isFinite(bb) && cur > bb) {
      return `Waarschuwing: huidige prijs (${cur}) is hoger dan je Buy below (${bb}).`;
    }
  }

  if (action === "SELL" && sellAbove) {
    const sa = Number(sellAbove);
    if (Number.isFinite(sa) && cur < sa) {
      return `Waarschuwing: huidige prijs (${cur}) is lager dan je Sell above (${sa}).`;
    }
  }

  return "";
};
