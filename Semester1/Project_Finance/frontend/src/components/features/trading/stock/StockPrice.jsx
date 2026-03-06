
const fmt = (n, decimals = 2) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";

  const factor = 10 ** decimals;
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  return rounded.toFixed(decimals);
};

export default function StockPrice({
  price,
  currency,
  exchange,
  change = null,
  changePercent = null,
  className = "",
}) {
  const isUp = change != null && change > 0;
  const isDown = change != null && change < 0;

  const hasChange = change != null && changePercent != null;

  const changeClass = isUp ? "text-success" : isDown ? "text-danger" : "text-muted";
  const arrow = isUp ? "▲" : isDown ? "▼" : null;

  const priceText =
    price != null ? `${fmt(price, 2)} ${currency || ""}` : "—";

  const changeText = hasChange
    ? `${fmt(change, 2)} (${fmt(changePercent, 2)}%)`
    : null;

  const metaText =
    currency && exchange ? `${currency} • ${exchange}` : currency || exchange || null;

  return (
    <div className={className}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="h3 mb-0">{priceText}</div>

          {changeText && (
            <div className={changeClass}>
              {arrow && `${arrow} `}
              {changeText}
            </div>
          )}
        </div>

        <div className="text-end">
          {metaText && <small className="text-muted">{metaText}</small>}
        </div>
      </div>
    </div>
  );
}
