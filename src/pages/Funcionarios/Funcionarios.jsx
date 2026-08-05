import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Funcionarios.css";

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [formulario, setFormulario] = useState({
    nome: "",
    cargo: "",
    pin: "",
    ativo: true,
  });

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  async function carregarFuncionarios() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get("/funcionarios");

      setFuncionarios(response.data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);

      if (error.response?.status === 401) {
        setErro("Sua sessão expirou. Entre novamente.");
      } else {
        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar os funcionários."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  function abrirFormulario() {
    setFormulario({
      nome: "",
      cargo: "",
      pin: "",
      ativo: true,
    });

    setErro("");
    setSucesso("");
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    if (salvando) {
      return;
    }

    setMostrarFormulario(false);
  }

  function atualizarCampo(event) {
    const { name, value, type, checked } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function cadastrarFuncionario(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!formulario.nome.trim()) {
      setErro("O nome do funcionário é obrigatório.");
      return;
    }

    if (!/^\d{4}$/.test(formulario.pin)) {
      setErro("O PIN deve conter exatamente 4 números.");
      return;
    }

    try {
      setSalvando(true);

      await api.post("/funcionarios", {
        nome: formulario.nome.trim(),
        cargo: formulario.cargo.trim() || null,
        pin: formulario.pin,
        ativo: formulario.ativo,
      });

      setSucesso("Funcionário cadastrado com sucesso.");
      setMostrarFormulario(false);

      await carregarFuncionarios();
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);

      setErro(
        error.response?.data?.erro ||
          error.response?.data?.mensagem ||
          "Não foi possível cadastrar o funcionário."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="funcionarios-page">
      <header className="funcionarios-header">
        <div>
          <h1>Funcionários</h1>
          <p>Gerencie os funcionários cadastrados no sistema.</p>
        </div>

        <button
          type="button"
          className="funcionarios-new-button"
          onClick={abrirFormulario}
        >
          + Novo funcionário
        </button>
      </header>

      {sucesso && (
        <div className="funcionarios-success">
          {sucesso}
        </div>
      )}

      {erro && !mostrarFormulario && (
        <div className="funcionarios-error">
          {erro}
        </div>
      )}

      {mostrarFormulario && (
        <div className="funcionarios-modal-overlay">
          <section className="funcionarios-modal">
            <header className="funcionarios-modal-header">
              <div>
                <h2>Novo funcionário</h2>
                <p>Preencha os dados para cadastrar.</p>
              </div>

              <button
                type="button"
                className="funcionarios-close-button"
                onClick={fecharFormulario}
                disabled={salvando}
              >
                ×
              </button>
            </header>

            <form
              className="funcionarios-form"
              onSubmit={cadastrarFuncionario}
            >
              <div className="funcionarios-field">
                <label htmlFor="nome">Nome</label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                  placeholder="Nome do funcionário"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="funcionarios-field">
                <label htmlFor="cargo">Cargo</label>

                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  value={formulario.cargo}
                  onChange={atualizarCampo}
                  placeholder="Ex.: Operador"
                  maxLength={100}
                />
              </div>

              <div className="funcionarios-field">
                <label htmlFor="pin">PIN</label>

                <input
                  id="pin"
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={formulario.pin}
                  onChange={(event) => {
                    const somenteNumeros =
                      event.target.value.replace(/\D/g, "");

                    setFormulario((formularioAtual) => ({
                      ...formularioAtual,
                      pin: somenteNumeros,
                    }));
                  }}
                  placeholder="4 números"
                  autoComplete="off"
                />
              </div>

              <label className="funcionarios-checkbox">
                <input
                  name="ativo"
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={atualizarCampo}
                />

                <span>Funcionário ativo</span>
              </label>

              {erro && (
                <div className="funcionarios-error">
                  {erro}
                </div>
              )}

              <div className="funcionarios-form-actions">
                <button
                  type="button"
                  className="funcionarios-cancel-button"
                  onClick={fecharFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="funcionarios-save-button"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {carregando && (
        <div className="funcionarios-message">
          Carregando funcionários...
        </div>
      )}

      {!carregando &&
        !erro &&
        funcionarios.length === 0 && (
          <div className="funcionarios-empty">
            Nenhum funcionário cadastrado.
          </div>
        )}

      {!carregando && funcionarios.length > 0 && (
        <div className="funcionarios-table-container">
          <table className="funcionarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Cargo</th>
                <th>PIN</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {funcionarios.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>{funcionario.id}</td>
                  <td>{funcionario.nome}</td>
                  <td>
                    {funcionario.cargo || "Não informado"}
                  </td>
                  <td>••••</td>
                  <td>
                    <span
                      className={
                        funcionario.ativo
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {funcionario.ativo
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Funcionarios;