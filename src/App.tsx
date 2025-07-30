import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css'
import Landing from "./pages/landing";
import AddSalary from "./pages/addSalary";
import ConfirmPage from "./pages/confirm";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ajouter-salaire" element={<AddSalary />} />
        <Route path="/confirm" element={<ConfirmPage />} />
      </Routes>
    </Router>
  );
}

export default App;
