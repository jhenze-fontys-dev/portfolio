import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

const ConditionalButton = ({
  disabled = false,
  tooltip = null,            // string | ReactNode
  tooltipWhen = "disabled",  // "disabled" | "always" | "never"
  placement = "top",
  onClick,
  children,
  ...rest
}) => {
  const shouldShowTooltip =
    tooltipWhen === "always"
      ? Boolean(tooltip)
      : tooltipWhen === "disabled"
        ? disabled && Boolean(tooltip)
        : false;

  const tooltipNode =
    typeof tooltip === "string" ? <span>{tooltip}</span> : tooltip;

  const buttonEl = (
    <Button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      // disabled buttons don’t trigger hover; OverlayTrigger needs a wrapper
      style={disabled ? { pointerEvents: "none" } : undefined}
      {...rest}
    >
      {children}
    </Button>
  );

  if (!shouldShowTooltip) {
    return buttonEl;
  }

  return (
    <OverlayTrigger
      placement={placement}
      overlay={<Tooltip>{tooltipNode}</Tooltip>}
    >
      <span className="d-inline-block">{buttonEl}</span>
    </OverlayTrigger>
  );
};

export default ConditionalButton;
