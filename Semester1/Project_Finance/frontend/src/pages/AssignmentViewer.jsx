import { useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function AssignmentViewer() {
  const { assignmentId } = useParams();
  const iframeRef = useRef(null);

  const src = useMemo(() => {
    const safeId = encodeURIComponent(String(assignmentId || ""));
    return `/jupyterlite/lab/index.html?mode=single-document&path=${safeId}.ipynb`;
  }, [assignmentId]);

  return (
    <Container fluid className="px-0">
      <div style={{ position: "relative" }}>
        <Link
          to="/opdrachten"
          className="btn btn-outline-secondary btn-sm"
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            zIndex: 10,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          Terug
        </Link>

        <iframe
          ref={iframeRef}
          id="jl"
          title={`JupyterLite - ${assignmentId}`}
          src={src}
          style={{
            width: "100%",
            height: "85vh",
            border: 0,
            display: "block",
          }}
          sandbox="allow-scripts allow-same-origin allow-downloads"
        />
      </div>
    </Container>
  );
}
