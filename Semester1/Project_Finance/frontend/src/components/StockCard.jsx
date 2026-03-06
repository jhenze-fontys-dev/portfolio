import { Card } from "react-bootstrap";

import StockSummary from "./features/StockSummary.jsx";
import StockChart from "./features/trading/stock/StockChart.jsx";
import StockStats from "./features/trading/stock/StockStats.jsx";

const StockCard = ({
  symbol,
  name,
  price,
  currency,
  exchange,

  change = null,
  changePercent = null,

  stats = null,   // { open, high, low, close }
  series = null,  // array [{ datetime, open, high, low, close }]
}) => {
  // We gebruiken close als "display price" als die aanwezig is (zoals je screenshots)
  const displayPrice = stats?.close ?? price ?? null;

  const metaText =
    currency && exchange ? `${currency} • ${exchange}` : currency || exchange || null;

  return (
    <Card className="mb-3">
      <Card.Body>
        {/* (1) Summary links + (3) Meta rechts */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <StockSummary
              symbol={symbol}
              name={name}
              currency={currency}
              price={displayPrice}
              change={change}
              changePercent={changePercent}
              layout="stack"
            />
          </div>

          <div className="text-end">
            {metaText && <small className="text-muted">{metaText}</small>}
          </div>
        </div>

        {/* (4) Chart */}
        <StockChart series={series} className="mb-3" />

        {/* (2) OHLC stats */}
        <StockStats stats={stats} fallbackClose={displayPrice} />
      </Card.Body>
    </Card>
  );
};

export default StockCard;
