import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "./Layout.css";

function Layout() {
  const navigate = useNavigate();

  const funcionarioSalvo =
    localStorage.getItem("funcionario");

  const funcionario = funcionarioSalvo
    ? JSON.parse(funcionarioSalvo)
    : null;

  function handleSair() {
    localStorage.removeItem("token");
    localStorage.removeItem("funcionario");

    navigate("/login");
  }

  function classeMenu({ isActive }) {
    return isActive
      ? "menu-link active"
      : "menu-link";
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>TORNESUL</h1>

          <span>
            Sistema de Apontamentos
          </span>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/dashboard"
            className={classeMenu}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/funcionarios"
            className={classeMenu}
          >
            Funcionários
          </NavLink>

          <NavLink
            to="/maquinas"
            className={classeMenu}
          >
            Máquinas
          </NavLink>

          <NavLink
            to="/producoes"
            className={classeMenu}
          >
            Produções
          </NavLink>

          <NavLink
            to="/apontamentos"
            className={classeMenu}
          >
            Apontamentos
          </NavLink>

          <NavLink
            to="/horarios"
            className={classeMenu}
          >
            Horários
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <strong>
              {funcionario?.nome ||
                "Funcionário"}
            </strong>

            <span>
              {funcionario?.cargo ||
                "Cargo não informado"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSair}
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;