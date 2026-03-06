import { Button, Form } from "react-bootstrap";

export default function SymbolSearch({
  symbol,
  onSymbolChange,
  onQuote,
  quoteDisabled,
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Symbool</Form.Label>

      <div className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Bijv. AAPL"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
        />

        <Button
          type="button"
          variant="secondary"
          disabled={quoteDisabled}
          onClick={onQuote}
        >
          Quote
        </Button>
      </div>
    </Form.Group>
  );
}
