import { Button, Form } from "react-bootstrap";

export default function PlanEditor({
  isTracked,

  plan,
  buyBelow,
  sellAbove,
  planAvailable,

  editMode,
  setEditMode,

  draftPlan,
  setDraftPlan,
  draftBuyBelow,
  setDraftBuyBelow,
  draftSellAbove,
  setDraftSellAbove,

  handleSave,
  handleCancel,
}) {
  if (!isTracked) {
    return (
      <div>
        <h6>Mijn plan</h6>

        <p className="text-muted mb-2">
          Je hebt nog geen plan opgeslagen. Voeg dit aandeel toe aan je watchlist (of koop het) om
          je plan te bewaren.
        </p>

        <div className="text-muted small">
          <div>
            <strong>Voorbeeld:</strong>
          </div>
          <div>Gemiddelde prijs: €150</div>
          <div>Hoogste prijs: €178</div>
          <div>Volatiliteit: gemiddeld</div>
          <div className="mt-1">Mijn plan: “Ik koop alleen als …”</div>
        </div>
      </div>
    );
  }

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div>
      <h6>Mijn plan</h6>

      {!editMode ? (
        <>
          <div className="mb-2">
            {plan ? (
              <p className="mb-2">{plan}</p>
            ) : (
              <p className="text-muted mb-2">Nog geen plan toegevoegd.</p>
            )}

            {(buyBelow || sellAbove) && (
              <p className="text-muted small mb-0">
                {buyBelow && (
                  <>
                    <strong>Buy below:</strong> {buyBelow}{" "}
                  </>
                )}
                {buyBelow && sellAbove && "• "}
                {sellAbove && (
                  <>
                    <strong>Sell above:</strong> {sellAbove}
                  </>
                )}
              </p>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            onClick={() => setEditMode(true)}
          >
            {planAvailable ? "Edit plan" : "Add plan"}
          </Button>
        </>
      ) : (
        <>
          <div className="d-flex gap-2 mb-2">
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Buy below (optional)"
              value={draftBuyBelow}
              onChange={(e) => setDraftBuyBelow(e.target.value)}
            />
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Sell above (optional)"
              value={draftSellAbove}
              onChange={(e) => setDraftSellAbove(e.target.value)}
            />
          </div>

          <Form.Control
            as="textarea"
            rows={4}
            className="mb-2"
            value={draftPlan}
            onChange={(e) => setDraftPlan(e.target.value)}
          />

          <div className="d-flex gap-2">
            <Button type="button" size="sm" variant="primary" onClick={handleSave}>
              Save
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
