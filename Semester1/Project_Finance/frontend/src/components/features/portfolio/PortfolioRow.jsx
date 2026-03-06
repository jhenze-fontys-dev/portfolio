import { NavLink } from "react-router-dom";
import StockSummary from "../StockSummary.jsx";

const fmt = (n, decimals = 2) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";

  const factor = 10 ** decimals;
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  return rounded.toFixed(decimals);
};

export default function PortfolioRow({ row }) {
  const open = row?.stats?.open ?? null;
  const high = row?.stats?.high ?? null;
  const low = row?.stats?.low ?? null;
  const close = row?.stats?.close ?? null;

  return (
    <>
      <tr>
        <td>
          <NavLink
            to="/trading"
            state={{ symbol: row.symbol }}
            className="text-decoration-none text-reset"
          >
            <StockSummary
              symbol={row.symbol}
              name={row.name}
              currency={row.currency}
              price={close}  
              change={row.change}
              changePercent={row.changePercent}
            />
          </NavLink>
        </td>

        <td className="text-end">{fmt(open, 2)}</td>
        <td className="text-end">{fmt(high, 2)}</td>
        <td className="text-end">{fmt(low, 2)}</td>
        <td className="text-end">{fmt(close, 2)}</td>

        <td className="text-end">{row.shares}</td>
      </tr>
    </>
  );
}
