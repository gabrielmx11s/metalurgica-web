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

function obterFuncionario() {
  const funcionarioSalvo =
    localStorage.getItem(
      "funcionario"
    );

  if (!funcionarioSalvo) {
    return null;
  }

  try {
    return JSON.parse(
      funcionarioSalvo
    );
  } catch {
    return null;
  }
}

function RotaAdmin({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  const funcionario =
    obterFuncionario();

  if (
    !token ||
    !funcionario
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    funcionario.perfil !==
    "ADMIN"
  ) {
    return (
      <Navigate
        to="/operacao"
        replace
      />
    );
  }

  return children;
}

function RotaOperador({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  const funcionario =
    obterFuncionario();

  if (
    !token ||
    !funcionario
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    funcionario.perfil ===
    "ADMIN"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  if (
    funcionario.perfil !==
    "OPERADOR"
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function RedirecionamentoInicial() {
  const token =
    localStorage.getItem(
      "token"
    );

  const funcionario =
    obterFuncionario();

  if (
    !token ||
    !funcionario
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    funcionario.perfil ===
    "ADMIN"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  if (
    funcionario.perfil ===
    "OPERADOR"
  ) {
    return (
      <Navigate
        to="/operacao"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/operacao"
          element={
            <RotaOperador>
              <Operacao />
            </RotaOperador>
          }
        />

        <Route
          element={
            <RotaAdmin>
              <Layout />
            </RotaAdmin>
          }
        >
          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/funcionarios"
            element={
              <Funcionarios />
            }
          />

          <Route
            path="/maquinas"
            element={
              <Maquinas />
            }
          />

          <Route
            path="/producoes"
            element={
              <Producoes />
            }
          />

          <Route
            path="/apontamentos"
            element={
              <Apontamentos />
            }
          />

          <Route
            path="/horarios"
            element={
              <Horarios />
            }
          />
        </Route>

        <Route
          path="/"
          element={
            <RedirecionamentoInicial />
          }
        />

        <Route
          path="*"
          element={
            <RedirecionamentoInicial />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;