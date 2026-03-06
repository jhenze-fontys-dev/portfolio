import { useEffect } from "react";
import { Alert, Col, Row } from "react-bootstrap";

import PortfolioSummaryCard from "../components/features/portfolio/PortfolioSummaryCard.jsx";
import PortfolioTable from "../components/features/portfolio/PortfolioTable.jsx";
import { usePortfolioOrchestrator } from "../helpers/portfolioOrchestrator.js";

const Portfolio = () => {
  // -------------------------------
  // Orchestrator
  // -------------------------------
  const { state, actions } = usePortfolioOrchestrator();

  // -------------------------------
  // Data
  // -------------------------------
  const { rows, summary } = state;

  // -------------------------------
  // Flags
  // -------------------------------
  const { loading, error } = state;

  // -------------------------------
  // Effects
  // -------------------------------
  useEffect(() => {
    actions.loadPortfolio();
  }, [actions]);

  return (
    <Row>
      <Col>
        <h1 className="mb-4">Portfolio</h1>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
          <>
            <PortfolioSummaryCard summary={summary} />
            <PortfolioTable rows={rows} />
          </>
        )}
      </Col>
    </Row>
  );
};

export default Portfolio;
