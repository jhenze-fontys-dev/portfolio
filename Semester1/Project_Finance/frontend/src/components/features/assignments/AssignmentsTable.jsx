import Table from "react-bootstrap/Table";
import AssignmentsRow from "./AssignmentsRow.jsx";

export default function AssignmentsTable({ assignments = [] }) {
  return (
    <Table striped bordered hover responsive className="align-middle">
      <thead>
        <tr>
          <th>Opdracht</th>
          <th style={{ width: "40%" }}>Beschrijving</th>
        </tr>
      </thead>

      <tbody>
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <AssignmentsRow key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <tr>
            <td colSpan={2} className="text-muted">
              Geen opdrachten gevonden.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
