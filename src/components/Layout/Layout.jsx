import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "./Layout.css";

function Layout() {
  const navigate = useNavigate();

  const funcionarioSalvo = localStorage.getItem("funcionario");

  const funcionario = funcionarioSalvo
    ? JSON.parse(funcionarioSalvo)
    : null;

  function handleSair() {
    localStorage.removeItem("token");
    localStorage.removeItem("funcionario");

    navigate("/login");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>TORNESUL</h1>
          <span>Sistema de Apontamentos</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/funcionarios"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Funcionários
          </NavLink>

          <NavLink
            to="/maquinas"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Máquinas
          </NavLink>

          <NavLink
            to="/apontamentos"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Apontamentos
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <strong>{funcionario?.nome || "Funcionário"}</strong>
            <span>{funcionario?.cargo || "Cargo não informado"}</span>
          </div>

          <button type="button" onClick={handleSair}>
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