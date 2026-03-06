import { useEffect, useRef, useState } from "react";
import { Modal, ProgressBar, Spinner, Badge, Button, Alert } from "react-bootstrap";

const PricesSyncModal = ({ syncState }) => {
  const [visible, setVisible] = useState(false);
  const openedAtRef = useRef(null);

  const phase = syncState?.phase;
  const isDone = phase === "done";
  const isWaiting = phase === "waiting";
  const waitSecs = Math.ceil((syncState?.nextRunInMs || 0) / 1000);

  const symbolsDone = syncState?.symbolsDone ?? 0;
  const symbolsTotal = syncState?.symbolsTotal ?? 0;
  const insertedRows = syncState?.insertedRows ?? 0;

  const percent = syncState?.percent ?? 0;
  const progressValue = isDone ? 100 : percent;
  const progressLabel = `${progressValue}%`;

  const batchSymbols = Array.isArray(syncState?.batchSymbols) ? syncState.batchSymbols : [];
  const batchLabel = isDone ? "Laatste batch:" : "Huidige batch:";

  // Open modal when sync starts (and keep it open until user closes after done)
  useEffect(() => {
    if (!phase) return;

    if (!openedAtRef.current) openedAtRef.current = Date.now();
    setVisible(true);
  }, [phase]);

  // Block refresh while visible
  useEffect(() => {
    if (!visible) return;

    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    openedAtRef.current = null;
  };

  if (!visible || !syncState) return null;

  const headerStatus = isDone ? (
    <div className="d-flex align-items-center gap-2">
      <span>✅</span>
      <strong>Klaar</strong>
    </div>
  ) : (
    <div className="d-flex align-items-center gap-2">
      <Spinner animation="border" size="sm" />
      <strong>Bezig…</strong>
    </div>
  );

  const subStatus = isDone ? (
    <div className="text-muted small">
      Symbols bijgewerkt: <strong>{symbolsDone}</strong> / {symbolsTotal} · Candles opgeslagen:{" "}
      <strong>{insertedRows}</strong>
    </div>
  ) : (
    <div className="text-muted small">
      {symbolsDone}/{symbolsTotal} · fase: {phase} · candles opgeslagen:{" "}
      <strong>{insertedRows}</strong>
      {isWaiting && <span className="text-muted"> — wachten ({waitSecs}s)</span>}
    </div>
  );

  return (
    <Modal
      show
      backdrop="static"
      keyboard={false}
      centered
      onHide={isDone ? handleClose : undefined}
    >
      <Modal.Header closeButton={isDone}>
        <Modal.Title>Koersdata bijwerken</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-2">
          {headerStatus}
          {subStatus}
        </div>

        <ProgressBar now={progressValue} label={progressLabel} />

        {isDone && (
          <Alert variant="success" className="mt-3 mb-0">
            Update voltooid.
            <br />
            <strong>{symbolsDone}</strong> symbols bijgewerkt · <strong>{insertedRows}</strong>{" "}
            candles opgeslagen.
          </Alert>
        )}

        {batchSymbols.length > 0 && (
          <div className="mt-3">
            <div className="text-muted small mb-1">{batchLabel}</div>
            <div className="d-flex flex-wrap gap-1">
              {batchSymbols.map((s) => (
                <Badge bg="secondary" key={s}>
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleClose} disabled={!isDone}>
          Sluiten
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PricesSyncModal;
