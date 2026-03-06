import { Form } from "react-bootstrap";

import ConditionalButton from "../../../common/ConditionalButton";

export default function TradeActions({
  isTracked,
  disabled = false,

  onWatch,

  shares,
  onSharesChange,

  onBuy,
  buyDisabled,
  buyTooltip,
  buyTooltipWhen,

  onSell,
  sellDisabled,
  sellTooltip,
  sellTooltipWhen,
}) {
  return (
    <>
      {/* -------------------------------
          Watchlist
      ------------------------------- */}
      <div className="d-flex gap-2 mb-3">
        <ConditionalButton
          type="button"
          variant="outline-primary"
          disabled={disabled || isTracked}
          tooltip={
            isTracked
              ? "Staat al in je watchlist ✓"
              : "Laad eerst een quote om toe te voegen aan je watchlist."
          }
          tooltipWhen="disabled"
          onClick={onWatch}
        >
          Add to watchlist
        </ConditionalButton>
      </div>

      {/* -------------------------------
          Shares
      ------------------------------- */}
      <Form.Group className="mb-3">
        <Form.Label>Aantal aandelen</Form.Label>

        <Form.Control
          type="number"
          min="1"
          step="1"
          placeholder="Bijv. 10"
          value={shares}
          disabled={disabled}
          onChange={(e) => onSharesChange(e.target.value)}
        />
      </Form.Group>

      {/* -------------------------------
          Buy / Sell
      ------------------------------- */}
      <div className="d-flex gap-2 mb-3">
        <ConditionalButton
          type="button"
          variant="primary"
          disabled={disabled || buyDisabled}
          tooltip={buyTooltip}
          tooltipWhen={buyTooltipWhen}
          onClick={onBuy}
        >
          Buy
        </ConditionalButton>

        <ConditionalButton
          type="button"
          variant="outline-danger"
          disabled={disabled || sellDisabled}
          tooltip={sellTooltip}
          tooltipWhen={sellTooltipWhen}
          onClick={onSell}
        >
          Sell
        </ConditionalButton>
      </div>
    </>
  );
}
