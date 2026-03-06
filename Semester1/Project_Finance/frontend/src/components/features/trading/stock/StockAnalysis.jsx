import { useMemo, useState } from "react";

export default function StockAnalysis({ analysis = null, className = "" }) {
  const [showFullPlan, setShowFullPlan] = useState(false);

  const shortPlan = useMemo(() => {
    const plan = analysis?.my_plan || "";
    if (!plan) return null;
    if (plan.length <= 200) return plan;
    return plan.slice(0, 200) + "...";
  }, [analysis]);

  if (!analysis) {
    return (
      <p className={`text-muted mb-0 ${className}`}>
        Je hebt nog geen analyse gemaakt voor dit aandeel.
      </p>
    );
  }

  const hasPlan = Boolean(analysis?.my_plan);

  return (
    <div className={className}>
      <h6 className="mb-2">Mijn analyse</h6>

      {analysis.volatility_label && (
        <p className="mb-1">
          <strong>Volatiliteit:</strong> {analysis.volatility_label}
        </p>
      )}

      {(analysis.avg_close || analysis.max_close || analysis.min_close) && (
        <p className="mb-2 small text-muted">
          Gem.: {analysis.avg_close ?? "—"} | Hoogste: {analysis.max_close ?? "—"} | Laagste:{" "}
          {analysis.min_close ?? "—"}
        </p>
      )}

      {hasPlan ? (
        <>
          <p className="mb-1">
            {showFullPlan ? analysis.my_plan : shortPlan}
          </p>

          {analysis.my_plan.length > 200 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={() => setShowFullPlan((v) => !v)}
            >
              {showFullPlan ? "Toon minder" : "Lees meer"}
            </button>
          )}
        </>
      ) : (
        <p className="text-muted mb-0">
          Je hebt nog geen plantekst ingevuld.
        </p>
      )}
    </div>
  );
}
