import Card from "react-bootstrap/Card";

const fmt = (n, decimals = 2) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toFixed(decimals);
};

export default function PortfolioSummaryCard({ summary }) {
  const cash = summary?.cash ?? 0;
  const holdingsValue = summary?.holdingsValue ?? 0;
  const totalValue = summary?.totalValue ?? 0;

  const dayChangeValue = summary?.dayChangeValue ?? 0;
  const dayChangePercent = summary?.dayChangePercent;

  const dir =
    dayChangeValue > 0 ? "up" : dayChangeValue < 0 ? "down" : "flat";

  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : null;
  const cls =
    dir === "up" ? "text-success" : dir === "down" ? "text-danger" : "text-muted";

  const pctText =
    Number.isFinite(Number(dayChangePercent)) ? `${fmt(dayChangePercent, 2)}%` : "—";

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-4">
          <div>
            <div className="text-muted small">Cash</div>
            <div className="fs-4 fw-semibold">{fmt(cash, 2)}</div>
          </div>

          <div>
            <div className="text-muted small">Holdings value</div>
            <div className="fs-4 fw-semibold">{fmt(holdingsValue, 2)}</div>
          </div>

          <div>
            <div className="text-muted small">Total value</div>
            <div className="fs-4 fw-semibold">{fmt(totalValue, 2)}</div>
          </div>

          <div className="text-end">
            <div className="text-muted small">Today</div>
            <div className={`fs-4 fw-semibold ${cls}`}>
              {arrow && <span className="me-2">{arrow}</span>}
              {fmt(dayChangeValue, 2)} <span className="fs-6">({pctText})</span>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
