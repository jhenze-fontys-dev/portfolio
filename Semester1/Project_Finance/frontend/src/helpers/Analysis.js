
// ---------- utils ----------
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function round(n, decimals = 2) {
  if (!Number.isFinite(n)) return null;
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function pickNumbers(candles, key) {
  if (!Array.isArray(candles)) return [];
  const out = [];
  for (const c of candles) {
    const n = toNumber(c?.[key]);
    if (n != null) out.push(n);
  }
  return out;
}

function firstCandle(candles) {
  return Array.isArray(candles) && candles.length > 0 ? candles[0] : null;
}

function lastCandle(candles) {
  return Array.isArray(candles) && candles.length > 0
    ? candles[candles.length - 1]
    : null;
}

// ======================================================================
// BASIS (altijd bruikbaar)
// ======================================================================

/**
 * meanClose(candles)
 * Gemiddelde slotkoers (close) over de periode.
 */
export function meanClose(candles) {
  const closes = pickNumbers(candles, "close");
  if (closes.length === 0) return null;
  const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
  return round(avg);
}

/**
 * periodHigh(candles)
 * Hoogste koers (high) in de periode.
 */
export function periodHigh(candles) {
  const highs = pickNumbers(candles, "high");
  if (highs.length === 0) return null;
  return round(Math.max(...highs));
}

/**
 * periodLow(candles)
 * Laagste koers (low) in de periode.
 */
export function periodLow(candles) {
  const lows = pickNumbers(candles, "low");
  if (lows.length === 0) return null;
  return round(Math.min(...lows));
}

/**
 * rangeHighLow(candles)
 * Bandbreedte: hoogste (high) - laagste (low).
 */
export function rangeHighLow(candles) {
  const hi = periodHigh(candles);
  const lo = periodLow(candles);
  if (hi == null || lo == null) return null;
  return round(hi - lo);
}

/**
 * avgDailyMove(candles)
 * Gemiddelde dagelijkse beweging binnen de candle, in procenten:
 * mean( (high - low) / close * 100 )
 */
export function avgDailyMove(candles) {
  if (!Array.isArray(candles)) return null;

  const moves = [];

  for (const c of candles) {
    const high = toNumber(c?.high);
    const low = toNumber(c?.low);
    const close = toNumber(c?.close);

    if (high == null || low == null || close == null || close <= 0) continue;

    const pct = ((high - low) / close) * 100;
    if (Number.isFinite(pct)) moves.push(pct);
  }

  if (moves.length === 0) return null;

  const avg = moves.reduce((a, b) => a + b, 0) / moves.length;
  return round(avg);
}

// ======================================================================
// UITBREIDINGEN (later conditioneel tonen: watchlist / portfolio)
// ======================================================================

/**
 * priceChange(candles)
 * Procentuele prijsverandering over de periode (eerste close -> laatste close).
 */
export function priceChange(candles) {
  const first = firstCandle(candles);
  const last = lastCandle(candles);

  const firstClose = toNumber(first?.close);
  const lastClose = toNumber(last?.close);

  if (firstClose == null || lastClose == null || firstClose <= 0) return null;

  return round(((lastClose - firstClose) / firstClose) * 100);
}

/**
 * distanceAverage(candles)
 * Procentuele afstand van de laatste close t.o.v. het gemiddelde (meanClose).
 */
export function distanceAverage(candles) {
  const mean = meanClose(candles);
  const last = lastCandle(candles);
  const lastClose = toNumber(last?.close);

  if (mean == null || lastClose == null || mean <= 0) return null;

  return round(((lastClose - mean) / mean) * 100);
}

/**
 * rangeAverage(candles)
 * Bandbreedte (high-low) als percentage van het gemiddelde (meanClose).
 */
export function rangeAverage(candles) {
  const range = rangeHighLow(candles);
  const mean = meanClose(candles);

  if (range == null || mean == null || mean <= 0) return null;

  return round((range / mean) * 100);
}

/**
 * risingDaysCount(candles)
 * Aantal dagen dat close hoger is dan de vorige close.
 */
export function risingDaysCount(candles) {
  const closes = pickNumbers(candles, "close");
  if (closes.length < 2) return null;

  let count = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) count++;
  }
  return count;
}

/**
 * risingDaysRatio(candles)
 * Percentage dagen dat close hoger is dan de vorige close.
 */
export function risingDaysRatio(candles) {
  const closes = pickNumbers(candles, "close");
  if (closes.length < 2) return null;

  const rising = risingDaysCount(candles);
  if (rising == null) return null;

  // aantal vergelijkingen = N-1
  return round((rising / (closes.length - 1)) * 100);
}

/**
 * maxPeakDrop(candles)
 * Grootste daling vanaf een eerdere top (op close), in procenten (negatief getal).
 */
export function maxPeakDrop(candles) {
  const closes = pickNumbers(candles, "close");
  if (closes.length < 2) return null;

  let peak = closes[0];
  let maxDrop = 0; // negatief (bijv. -12.3)

  for (let i = 1; i < closes.length; i++) {
    const c = closes[i];
    if (c > peak) peak = c;

    if (peak > 0) {
      const drop = ((c - peak) / peak) * 100; // <= 0
      if (drop < maxDrop) maxDrop = drop;
    }
  }

  return round(maxDrop);
}

// ======================================================================
// OPTIONAL: indicator helper
// ======================================================================

/**
 * sma(candles, period)
 * Simple Moving Average (laatste waarde) op close.
 */
export function sma(candles, period) {
  const p = Number(period);
  const closes = pickNumbers(candles, "close");

  if (!Number.isFinite(p) || p < 1) return null;
  if (closes.length < p) return null;

  const slice = closes.slice(closes.length - p);
  const avg = slice.reduce((a, b) => a + b, 0) / slice.length;

  return round(avg);
}
