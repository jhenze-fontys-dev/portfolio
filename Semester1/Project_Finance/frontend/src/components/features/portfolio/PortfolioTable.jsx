import { Table } from "react-bootstrap";
import PortfolioRow from "./PortfolioRow.jsx";

const PortfolioTable = ({ rows }) => {
  return (
    <Table striped bordered hover responsive className="align-middle">
      <thead>
        <tr>
          <th>Stock</th>
          <th className="text-end">Open</th>
          <th className="text-end">High</th>
          <th className="text-end">Low</th>
          <th className="text-end">Close</th>
          <th className="text-end">Shares</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-muted">
              No holdings yet.
            </td>
          </tr>
        ) : (
          rows.map((row) => <PortfolioRow key={row.symbol} row={row} />)
        )}
      </tbody>
    </Table>
  );
};

export default PortfolioTable;
