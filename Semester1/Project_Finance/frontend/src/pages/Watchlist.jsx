import { useEffect } from "react";
import { Alert, Col, Row } from "react-bootstrap";

import WatchlistTable from "../components/features/watchlist/WatchlistTable.jsx";
import { useWatchlistOrchestrator } from "../helpers/watchlistOrchestrator.js";

export default function Watchlist() {
  // -------------------------------
  // Orchestrator
  // -------------------------------
  const { state, actions } = useWatchlistOrchestrator();

  // -------------------------------
  // Data
  // -------------------------------
  const { rows } = state;

  // -------------------------------
  // Flags
  // -------------------------------
  const { loading, error } = state;

  // -------------------------------
  // Effects
  // -------------------------------
  useEffect(() => {
    actions.loadWatchlist();
  }, [actions]);

  const handleRemove = async (watchId) => {
    try {
      await actions.removeFromWatchlist(watchId);
      await actions.loadWatchlist();
    } catch (e) {
      // keep simple for now
      console.error(e);
      alert(e?.message || "Failed to remove item");
    }
  };

  return (
    <Row>
      <Col>
        <h1 className="mb-4">Watchlist</h1>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
          <WatchlistTable rows={rows} onRemove={handleRemove} />
        )}
      </Col>
    </Row>
  );
}
