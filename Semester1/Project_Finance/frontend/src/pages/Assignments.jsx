import { Container } from "react-bootstrap";
import AssignmentsTable from "../components/features/assignments/AssignmentsTable.jsx";

export default function Assignments() {
  const assignments = [
    {
      id: "opdracht-1",
      title: "Opdracht 1 — Basis portfolio-analyse",
      description:
        "Werk in JupyterLite aan opdracht 1 en beantwoord de bijbehorende vragen in het notebook.",
    },
    {
      id: "opdracht-2",
      title: "Opdracht 2 — Verdieping marktdata",
      description:
        "Analyseer marktdata en trends in opdracht 2 via het JupyterLite notebook.",
    },
  ];

  return (
    <Container>
      <h1 className="mb-4">Opdrachten</h1>
      <AssignmentsTable assignments={assignments} />
    </Container>
  );
}
