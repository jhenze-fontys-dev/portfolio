import { Container } from "react-bootstrap";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />

      <Container className="mt-4 mb-4">
        {children}
      </Container>

      <Footer />
    </>
  );
};

export default Layout;
