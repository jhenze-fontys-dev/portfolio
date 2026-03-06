import { Table } from "react-bootstrap";
import WatchlistRow from "./WatchlistRow.jsx";

export default function WatchlistTable({ rows, onRemove }) {
  return (
    <Table striped hover responsive className="align-middle">
      <thead>
        <tr>
          <th>Stock</th>
          <th className="text-end">Open</th>
          <th className="text-end">High</th>
          <th className="text-end">Low</th>
          <th className="text-end">Close</th>
          <th className="text-end"></th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-muted">
              No items in watchlist yet.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <WatchlistRow key={row.watchId} row={row} onRemove={onRemove} />
          ))
        )}
      </tbody>
    </Table>
  );
}
