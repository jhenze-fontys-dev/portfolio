import { Modal, Button, Alert } from "react-bootstrap";

export default function TradeActionModal({
  // Context
  symbol,

  // Data
  action,
  warning,
  shares,
  phase = "confirm", // "confirm" | "success"

  // Flags
  show,
  submitting = false,

  // UI
  onCancel,
  onConfirm,
  onContinue,
  onViewPortfolio,
}) {
  const upper = symbol?.trim().toUpperCase();

  const title =
    phase === "success"
      ? "Trade completed"
      : action === null
      ? "Actie niet mogelijk"
      : action === "SELL"
      ? "Bevestig verkoop"
      : action === "BUY"
      ? "Bevestig aankoop"
      : "Toevoegen aan watchlist";

  return (
    <Modal centered show={show} onHide={onCancel} size="md">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: 160 }}>
        {phase === "success" ? (
          <>
            <p className="mb-2">
              Trade completed for <strong>{upper}</strong>.
            </p>

            <p className="text-muted mb-0">
              Wil je terug naar je portfolio om het effect te zien, of wil je
              verdergaan met traden?
            </p>
          </>
        ) : action === "WATCH" ? (
          <>
            <p className="mb-2">
              Wil je <strong>{upper}</strong> toevoegen aan je watchlist?
            </p>

            <p className="text-muted mb-0">
              Daarna kunnen extra analyse-periodes beschikbaar worden (en we
              kunnen daily prices syncen).
            </p>
          </>
        ) : action ? (
          <>
            <p className="mb-2">
              Weet je zeker dat je <strong>{shares}</strong> aandelen van{" "}
              <strong>{upper}</strong> wilt{" "}
              <strong>{action === "SELL" ? "verkopen" : "kopen"}</strong>?
            </p>

            {warning && (
              <Alert variant="warning" className="mb-0">
                {warning}
              </Alert>
            )}
          </>
        ) : (
          <p className="mb-0">{warning}</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        {phase === "success" ? (
          <>
            <Button variant="secondary" onClick={onContinue}>
              Continue trading
            </Button>

            <Button variant="primary" onClick={onViewPortfolio}>
              View portfolio
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onCancel}>
              Annuleren
            </Button>

            {action && (
              <Button
                type="button"
                variant={action === "SELL" ? "danger" : "primary"}
                onClick={onConfirm}
                disabled={submitting}
              >
                {action === "WATCH"
                  ? "Toevoegen"
                  : `Ja, ${action === "SELL" ? "verkopen" : "kopen"}`}
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
