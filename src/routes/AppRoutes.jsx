import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "../components/Layout/Layout";

import Apontamentos from "../pages/Apontamentos/Apontamentos";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funcionarios from "../pages/Funcionarios/Funcionarios";
import Horarios from "../pages/Horarios/Horarios";
import Login from "../pages/Login/Login";
import Maquinas from "../pages/Maquinas/Maquinas";
import Operacao from "../pages/Operacao/Operacao";
import Producoes from "../pages/Producoes/Producoes";

function RotaProtegida({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/operacao"
          element={
            <RotaProtegida>
              <Operacao />
            </RotaProtegida>
          }
        />

        <Route
          element={
            <RotaProtegida>
              <Layout />
            </RotaProtegida>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/funcionarios"
            element={<Funcionarios />}
          />

          <Route
            path="/maquinas"
            element={<Maquinas />}
          />

          <Route
            path="/producoes"
            element={<Producoes />}
          />

          <Route
            path="/apontamentos"
            element={<Apontamentos />}
          />

          <Route
            path="/horarios"
            element={<Horarios />}
          />
        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;