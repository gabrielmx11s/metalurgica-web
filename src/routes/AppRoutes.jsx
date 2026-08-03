import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funcionarios from "../pages/Funcionarios/Funcionarios";
import Maquinas from "../pages/Maquinas/Maquinas";
import Apontamentos from "../pages/Apontamentos/Apontamentos";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/maquinas" element={<Maquinas />} />
        <Route path="/apontamentos" element={<Apontamentos />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;