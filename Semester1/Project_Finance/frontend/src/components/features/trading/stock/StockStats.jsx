const fmt = (n, decimals = 2) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";

  const factor = 10 ** decimals;
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  return rounded.toFixed(decimals);
};

export default function StockStats({ stats = null, fallbackClose = null, className = "" }) {
  const open = stats?.open ?? null;
  const high = stats?.high ?? null;
  const low = stats?.low ?? null;
  const close = stats?.close ?? fallbackClose ?? null;

  return (
    <div className={className}>
      <div className="d-flex justify-content-between text-muted small">
        <div>
          <strong>Open: </strong>
          {fmt(open, 2)}
        </div>
        <div>
          <strong>High: </strong>
          {fmt(high, 2)}
        </div>
        <div>
          <strong>Low: </strong>
          {fmt(low, 2)}
        </div>
        <div>
          <strong>Close: </strong>
          {fmt(close, 2)}
        </div>
      </div>
    </div>
  );
}
