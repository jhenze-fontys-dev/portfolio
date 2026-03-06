export default function AnalysisValues({ analysis }) {
  if (!analysis) {
    return <p className="text-muted mb-0">Nog geen analyse beschikbaar.</p>;
  }

  const col1 = [
    { label: "Gem. prijs", value: analysis.avg },
    { label: "Volatiliteit", value: analysis.volatility },
  ];

  const col2 = [
    { label: "Hoogste", value: analysis.max },
    { label: "Laagste", value: analysis.min },
  ];

  const renderColumn = (items) => (
    <div className="d-flex flex-column gap-2">
      {items.map((it) => (
        <div key={it.label}>
          <strong className="me-1">{it.label}:</strong>
          <span>{it.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="border rounded-3 p-3">
      <div className="row g-4">
        <div className="col-12 col-md-6">
          {renderColumn(col1)}
        </div>

        <div className="col-12 col-md-6">
          {renderColumn(col2)}
        </div>
      </div>
    </div>
  );
}
