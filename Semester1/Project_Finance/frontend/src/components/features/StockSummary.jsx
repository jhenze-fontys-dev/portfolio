import Badge from "react-bootstrap/Badge";

export default function StockSummary({
  symbol,
  name = null,
  currency = null,

  price = null,
  change = null,
  changePercent = null,

  metaText = null,
  layout = "row", // "row" (default: table-friendly) | "stack" (card-friendly)
  className = "",
}) {
  const hasPrice = Number.isFinite(Number(price));
  const hasChange = Number.isFinite(Number(change));
  const hasChangePct = Number.isFinite(Number(changePercent));

  const changeNumber = hasChange ? Number(change) : null;
  const pctNumber = hasChangePct ? Number(changePercent) : null;

  const direction =
    changeNumber == null ? "flat" : changeNumber > 0 ? "up" : changeNumber < 0 ? "down" : "flat";

  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : null;
  const changeClass =
    direction === "up" ? "text-success" : direction === "down" ? "text-danger" : "text-muted";

  const fmt = (n, decimals = 2) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";

    const factor = 10 ** decimals;
    const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

    return rounded.toFixed(decimals);
  };

  const priceText = hasPrice ? fmt(price, 2) : "—";
  const changeText = hasChange ? fmt(change, 2) : "—";
  const pctText = hasChangePct ? `${fmt(pctNumber, 2)}%` : "—";

  // --- Card layout: price/change stacked under name (your StockCard screenshot) ---
  if (layout === "stack") {
    return (
      <div className={className}>
        {/* Title row */}
        <div className="d-flex align-items-center gap-2">
          <Badge bg="secondary">{symbol}</Badge>
          <div className="fw-semibold">{name || symbol}</div>
        </div>

        {/* Price + change under title */}
        <div className="mt-2">
          <div className="h3 mb-0">
            {priceText} {currency || ""}
          </div>

          <div className={`small ${changeClass}`}>
            {arrow && <span className="me-1">{arrow}</span>}
            {changeText} ({pctText})
          </div>
        </div>

        {/* Optional meta (small) */}
        {metaText && <div className="text-muted small mt-1">{metaText}</div>}
      </div>
    );
  }

  // --- Default: table layout (Portfolio/Watchlist friendly) ---
  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      {/* Left: logo/badge first, then full name */}
      <div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="secondary">{symbol}</Badge>
          <div className="fw-semibold">{name || symbol}</div>
        </div>

        {metaText && <div className="text-muted small">{metaText}</div>}
      </div>

      {/* Right: price + change */}
      <div className="text-end">
        <div className="fw-semibold">
          {priceText} {currency || ""}
        </div>

        <div className={`small ${changeClass}`}>
          {arrow && <span className="me-1">{arrow}</span>}
          {changeText} ({pctText})
        </div>
      </div>
    </div>
  );
}
