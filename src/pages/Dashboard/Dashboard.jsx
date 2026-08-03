import { useNavigate } from "react-router-dom";

function Dashboard() {
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
    <main>
      <h1>Dashboard</h1>

      {funcionario ? (
        <>
          <p>Bem-vindo, {funcionario.nome}.</p>
          <p>Cargo: {funcionario.cargo || "Não informado"}</p>
        </>
      ) : (
        <p>Funcionário não identificado.</p>
      )}

      <button type="button" onClick={handleSair}>
        Sair
      </button>
    </main>
  );
}

export default Dashboard;