// src/components/features/trading/analysis/RangeSelector.jsx
import { Button, ButtonGroup } from "react-bootstrap";
import ConditionalButton from "../../../common/ConditionalButton";

export default function RangeSelector({
  rangeLabel,
  rangeDays,
  setRange,
  disabled = false,
  extendedDisabled = false,
  extendedTooltip = "Alleen beschikbaar als dit aandeel in je watchlist staat ✓",
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h6 className="mb-0">Analyse ({rangeLabel})</h6>

      <ButtonGroup size="sm">
        <Button
          size="sm"
          style={{ minWidth: "3.25rem" }}
          variant={rangeDays === 30 ? "primary" : "outline-primary"}
          onClick={() => setRange(30)}
          disabled={disabled}
          type="button"
        >
          30D
        </Button>

        <ConditionalButton
          size="sm"
          style={{ minWidth: "3.25rem" }}
          variant={rangeDays === 100 ? "primary" : "outline-primary"}
          type="button"
          disabled={extendedDisabled}
          tooltip={extendedTooltip}
          tooltipWhen="disabled"
          onClick={() => setRange(100)}
        >
          100D
        </ConditionalButton>

        <ConditionalButton
          size="sm"
          style={{ minWidth: "3.25rem" }}
          variant={rangeDays === 365 ? "primary" : "outline-primary"}
          type="button"
          disabled={extendedDisabled}
          tooltip={extendedTooltip}
          tooltipWhen="disabled"
          onClick={() => setRange(365)}
        >
          1Y
        </ConditionalButton>

        <ConditionalButton
          size="sm"
          style={{ minWidth: "3.25rem" }}
          variant={rangeDays === 730 ? "primary" : "outline-primary"}
          type="button"
          disabled={extendedDisabled}
          tooltip={extendedTooltip}
          tooltipWhen="disabled" 
          onClick={() => setRange(730)}
        >
          2Y
        </ConditionalButton>
      </ButtonGroup>
    </div>
  );
}
