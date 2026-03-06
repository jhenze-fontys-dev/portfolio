import { useNavigate } from "react-router-dom";

export default function AssignmentsRow({ assignment }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/opdrachten/${assignment.id}`);
  };

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <td className="fw-semibold">{assignment.title}</td>
      <td className="text-muted">{assignment.description}</td>
    </tr>
  );
}
