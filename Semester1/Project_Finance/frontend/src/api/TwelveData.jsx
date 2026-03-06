const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY;
const BASE_URL = "https://api.twelvedata.com";

function assertApiKey() {
  if (!API_KEY) {
    throw new Error("Missing TwelveData API key (VITE_TWELVE_DATA_KEY).");
  }
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network error: " + response.status);
  }

  const data = await response.json();

  // TwelveData error format
  if (data?.status === "error" || data?.code) {
    throw new Error(data?.message || "Twelve Data API error");
  }

  return data;
}

export async function lookupStock(symbol) {
  assertApiKey();

  const trimmed = symbol?.trim();
  if (!trimmed) throw new Error("Symbol is required");

  const url =
    `${BASE_URL}/quote` +
    `?symbol=${encodeURIComponent(trimmed)}` +
    `&apikey=${API_KEY}`;

  const data = await fetchJson(url);

  // single or multiple symbols
  const quote = data.data ? data.data[0] : data;

  if (!quote || !quote.symbol) {
    throw new Error("No data found for that symbol");
  }

  return {
    symbol: quote.symbol,
    name: quote.name,
    price: Number(quote.close ?? quote.price),
    currency: quote.currency,
    exchange: quote.exchange,
    raw: quote,
  };
}

/**
 * Fetch daily time series for N days (30 or 100).
 * Returns array sorted oldest -> newest.
 * Each item: { datetime, open, high, low, close, volume }
 */
export async function fetchTimeSeries(symbol, days = 30) {
  assertApiKey();

  const trimmed = symbol?.trim();
  if (!trimmed) throw new Error("Symbol is required");

  const d = Number(days);
  const outputsize = d === 100 ? 100 : 30; // enforce allowed values (30/100)

  const url =
    `${BASE_URL}/time_series` +
    `?symbol=${encodeURIComponent(trimmed)}` +
    `&interval=1day` +
    `&outputsize=${outputsize}` +
    `&apikey=${API_KEY}`;

  const data = await fetchJson(url);

  const values = Array.isArray(data?.values) ? data.values : [];
  if (values.length === 0) {
    throw new Error("No time series data found for that symbol");
  }

  // API often returns newest -> oldest; reverse for charting/calculations
  return values
    .map((item) => ({
      datetime: item.datetime,
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: item.volume != null ? Number(item.volume) : null,
    }))
    .reverse();
}
