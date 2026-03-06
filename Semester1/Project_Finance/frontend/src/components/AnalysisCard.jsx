import { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";

import SymbolSearch from "./features/trading/analysis/SymbolSearch";
import RangeSelector from "./features/trading/analysis/RangeSelector";
import AnalysisValues from "./features/trading/analysis/AnalysisValues";
import TradeActions from "./features/trading/analysis/TradeActions";
import PlanEditor from "./features/trading/analysis/PlanEditor";

const AnalysisCard = ({
  // Search
  symbol,
  onSymbolChange,
  onQuote,
  loading = false,

  // Market state
  hasQuote = false,
  isTracked = false,
  canSell = false,

  // Range
  rangeDays = 30,
  onRangeDaysChange,

  // Trade actions
  onWatch,
  shares,
  onSharesChange,
  onBuy,
  onSell,

  // Analysis
  analysis = null,

  // Plan
  plan = "",
  buyBelow = "",
  sellAbove = "",
  onSavePlan,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [draftPlan, setDraftPlan] = useState(plan || "");
  const [draftBuyBelow, setDraftBuyBelow] = useState(buyBelow || "");
  const [draftSellAbove, setDraftSellAbove] = useState(sellAbove || "");

  const resetDrafts = () => {
    setDraftPlan(plan || "");
    setDraftBuyBelow(buyBelow || "");
    setDraftSellAbove(sellAbove || "");
  };

  useEffect(() => {
    if (!hasQuote || !isTracked) setEditMode(false);
  }, [hasQuote, isTracked]);

  useEffect(() => {
    if (!editMode) resetDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, buyBelow, sellAbove, editMode]);

  const handleSave = () => {
    onSavePlan?.(draftPlan, draftBuyBelow, draftSellAbove);
    setEditMode(false);
  };

  const handleCancel = () => {
    resetDrafts();
    setEditMode(false);
  };

  const setRange = (days) => onRangeDaysChange?.(days);

  // -------------------------------
  // Derived UI state
  // -------------------------------
  const rangeLabel =
    rangeDays === 100 ? "100 dagen" :
    rangeDays === 365 ? "1 jaar" :
    rangeDays === 730 ? "2 jaar" :
    "30 dagen";

  const symbolAvailable = Boolean(symbol?.trim());
  const canQuote = symbolAvailable && !loading;
  const marketDataAvailable = hasQuote;

  const quoteDisabled = !canQuote;
  const uiDisabled = !marketDataAvailable;

  const planAvailable = Boolean((plan || "").trim() || buyBelow || sellAbove);

  const sharesValid = useMemo(() => {
    const n = Number(shares);
    return Number.isFinite(n) && n >= 1;
  }, [shares]);

  const rangeRules = useMemo(() => {
    const canUse30D = marketDataAvailable;
    const canUseExtended = marketDataAvailable && isTracked;

    const extendedDisabled = !canUseExtended;
    const extendedTooltip = !marketDataAvailable
      ? "Laad eerst een quote om andere periodes te kiezen."
      : "Alleen beschikbaar als dit aandeel in je watchlist staat ✓";

    return { canUse30D, canUseExtended, extendedDisabled, extendedTooltip };
  }, [marketDataAvailable, isTracked]);

  const tradeRules = useMemo(() => {
    let buyDisabled = true;
    let buyTooltip = null;
    let buyTooltipWhen = "never";

    if (!marketDataAvailable) {
      buyTooltip = "Laad eerst een quote om te kunnen kopen.";
      buyTooltipWhen = "disabled";
    } else if (!sharesValid) {
      buyTooltip = "Vul aantal aandelen in (minimaal 1).";
      buyTooltipWhen = "disabled";
    } else {
      buyDisabled = false;
      if (!planAvailable) {
        buyTooltip =
          "Je hebt nog geen plan. Tip: voeg dit aandeel toe aan je watchlist (of koop het) en leg daarna je buy-below / sell-above vast.";
        buyTooltipWhen = "always";
      }
    }

    let sellDisabled = true;
    let sellTooltip = null;
    let sellTooltipWhen = "never";

    if (!marketDataAvailable) {
      sellTooltip = "Laad eerst een quote om te kunnen verkopen.";
      sellTooltipWhen = "disabled";
    } else if (!sharesValid) {
      sellTooltip = "Vul aantal aandelen in (minimaal 1).";
      sellTooltipWhen = "disabled";
    } else if (!canSell) {
      sellTooltip = "Je kunt alleen verkopen als je dit aandeel in je portfolio hebt.";
      sellTooltipWhen = "disabled";
    } else {
      sellDisabled = false;
    }

    return {
      buyDisabled,
      buyTooltip,
      buyTooltipWhen,
      sellDisabled,
      sellTooltip,
      sellTooltipWhen,
    };
  }, [marketDataAvailable, sharesValid, planAvailable, canSell]);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title className="mb-3">Analyse & Actie</Card.Title>

        <SymbolSearch
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          onQuote={onQuote}
          quoteDisabled={quoteDisabled}
        />

        {!hasQuote && (
          <p className="text-muted mb-3">
            Vul een symbool in en klik op <strong>Quote</strong> om data te laden.
          </p>
        )}

        <div className="mb-4">
          <RangeSelector
            rangeLabel={rangeLabel}
            rangeDays={rangeDays}
            setRange={setRange}
            disabled={!rangeRules.canUse30D}
            extendedDisabled={rangeRules.extendedDisabled}
            extendedTooltip={rangeRules.extendedTooltip}
          />
          <AnalysisValues analysis={analysis} />
        </div>

        <hr />

        <TradeActions
          isTracked={isTracked}
          disabled={uiDisabled}
          onWatch={onWatch}
          shares={shares}
          onSharesChange={onSharesChange}
          onBuy={onBuy}
          onSell={onSell}
          buyDisabled={tradeRules.buyDisabled}
          buyTooltip={tradeRules.buyTooltip}
          buyTooltipWhen={tradeRules.buyTooltipWhen}
          sellDisabled={tradeRules.sellDisabled}
          sellTooltip={tradeRules.sellTooltip}
          sellTooltipWhen={tradeRules.sellTooltipWhen}
        />

        <hr />

        <PlanEditor
          isTracked={isTracked}
          plan={plan}
          buyBelow={buyBelow}
          sellAbove={sellAbove}
          planAvailable={planAvailable}
          editMode={editMode}
          setEditMode={setEditMode}
          draftPlan={draftPlan}
          setDraftPlan={setDraftPlan}
          draftBuyBelow={draftBuyBelow}
          setDraftBuyBelow={setDraftBuyBelow}
          draftSellAbove={draftSellAbove}
          setDraftSellAbove={setDraftSellAbove}
          handleSave={handleSave}
          handleCancel={handleCancel}
        />
      </Card.Body>
    </Card>
  );
};

export default AnalysisCard;
