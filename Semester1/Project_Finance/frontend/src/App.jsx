import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./style/app.css";

// COMPONENTS
import Home from "./pages/Home";
import Trading from "./pages/Trading";
import Portfolio from "./pages/Portfolio.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import History from "./pages/History";
import Assignments from "./pages/Assignments.jsx";
import AssignmentViewer from "./pages/AssignmentViewer.jsx";
import NotFound from "./pages/404";
import NavBar from "./components/NavBar";

// DAILY PRICES
import { syncDailyPrices } from "./helpers/DailyPriceUpdater";
import PricesSyncModal from "./components/PricesSyncModal";

const App = () => {
  const [syncState, setSyncState] = useState(null);

  useEffect(() => {
    syncDailyPrices(null, { onProgress: setSyncState }).catch(console.error);
  }, []);

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <div className="container">
        <NavBar />

        <PricesSyncModal syncState={syncState} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/history" element={<History />} />
          <Route path="/opdrachten" element={<Assignments />} />
          <Route path="/opdrachten/:assignmentId" element={<AssignmentViewer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
