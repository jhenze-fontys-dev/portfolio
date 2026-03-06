import { Link, NavLink } from "react-router-dom";

const NavBar = () => {
  const navActive = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand">
          {"ON{CT} Finance"}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink to="/trading" className={navActive}>
                Trading
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/portfolio" className={navActive}>
                Portfolio
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/watchlist" className={navActive}>
                Watchlist
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/history" className={navActive}>
                History
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/opdrachten" className={navActive}>
                Opdrachten
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
