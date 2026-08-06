import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Maquinas.css";

const formularioInicial = {
  numero: "",
  nome: "",
  ativo: true,
};

function Maquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [modoFormulario, setModoFormulario] =
    useState("cadastrar");

  const [maquinaEditandoId, setMaquinaEditandoId] =
    useState(null);

  const [formulario, setFormulario] =
    useState(formularioInicial);

  useEffect(() => {
    carregarMaquinas();
  }, []);

  async function carregarMaquinas() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get("/maquinas");

      setMaquinas(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar máquinas:",
        error
      );

      if (error.response?.status === 401) {
        setErro(
          "Sua sessão expirou. Entre novamente."
        );
      } else {
        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar as máquinas."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  function abrirCadastro() {
    setModoFormulario("cadastrar");
    setMaquinaEditandoId(null);
    setFormulario(formularioInicial);

    setErro("");
    setSucesso("");
    setMostrarFormulario(true);
  }

  function abrirEdicao(maquina) {
    setModoFormulario("editar");
    setMaquinaEditandoId(maquina.id);

    setFormulario({
      numero: maquina.numero || "",
      nome: maquina.nome || "",
      ativo: maquina.ativo ?? true,
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
    setMaquinaEditandoId(null);
    setFormulario(formularioInicial);
    setErro("");
  }

  function atualizarCampo(event) {
    const { name, value, type, checked } =
      event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function validarFormulario() {
    if (!formulario.numero.trim()) {
      setErro(
        "O número da máquina é obrigatório."
      );

      return false;
    }

    if (!formulario.nome.trim()) {
      setErro(
        "O nome da máquina é obrigatório."
      );

      return false;
    }

    return true;
  }

  async function salvarMaquina(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!validarFormulario()) {
      return;
    }

    const dados = {
      numero: formulario.numero.trim(),
      nome: formulario.nome.trim(),
      ativo: formulario.ativo,
    };

    try {
      setSalvando(true);

      if (modoFormulario === "editar") {
        await api.put(
          `/maquinas/${maquinaEditandoId}`,
          dados
        );

        setSucesso(
          "Máquina atualizada com sucesso."
        );
      } else {
        await api.post("/maquinas", dados);

        setSucesso(
          "Máquina cadastrada com sucesso."
        );
      }

      setMostrarFormulario(false);
      setMaquinaEditandoId(null);
      setFormulario(formularioInicial);

      await carregarMaquinas();
    } catch (error) {
      console.error(
        "Erro ao salvar máquina:",
        error
      );

      if (error.response?.status === 401) {
        setErro(
          "Sua sessão expirou. Entre novamente."
        );
      } else {
        setErro(
          error.response?.data?.erro ||
            error.response?.data?.mensagem ||
            "Não foi possível salvar a máquina."
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="maquinas-page">
      <header className="maquinas-header">
        <div>
          <h1>Máquinas</h1>

          <p>
            Gerencie as máquinas cadastradas
            no sistema.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirCadastro}
        >
          + Nova máquina
        </button>
      </header>

      {sucesso && (
        <div className="maquinas-success">
          {sucesso}
        </div>
      )}

      {erro && !mostrarFormulario && (
        <div className="maquinas-error">
          {erro}
        </div>
      )}

      {mostrarFormulario && (
        <div className="maquinas-modal-overlay">
          <section className="maquinas-modal">
            <header className="maquinas-modal-header">
              <div>
                <h2>
                  {modoFormulario === "editar"
                    ? "Editar máquina"
                    : "Nova máquina"}
                </h2>

                <p>
                  {modoFormulario === "editar"
                    ? "Atualize os dados da máquina."
                    : "Preencha os dados para cadastrar."}
                </p>
              </div>

              <button
                type="button"
                className="maquinas-close-button"
                onClick={fecharFormulario}
                disabled={salvando}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </header>

            <form
              className="maquinas-form"
              onSubmit={salvarMaquina}
            >
              <div className="maquinas-field">
                <label htmlFor="numero">
                  Número
                </label>

                <input
                  id="numero"
                  name="numero"
                  type="text"
                  value={formulario.numero}
                  onChange={atualizarCampo}
                  placeholder="Ex.: 01"
                  maxLength={30}
                  autoFocus
                />
              </div>

              <div className="maquinas-field">
                <label htmlFor="nome">
                  Nome
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                  placeholder="Ex.: Torno Romi"
                  maxLength={100}
                />
              </div>

              <label className="maquinas-checkbox">
                <input
                  name="ativo"
                  type="checkbox"
                  checked={formulario.ativo}
                  onChange={atualizarCampo}
                />

                <span>
                  Máquina ativa
                </span>
              </label>

              {erro && (
                <div className="maquinas-error">
                  {erro}
                </div>
              )}

              <div className="maquinas-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={fecharFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : modoFormulario === "editar"
                      ? "Salvar alterações"
                      : "Cadastrar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {carregando && (
        <div className="maquinas-message">
          Carregando máquinas...
        </div>
      )}

      {!carregando &&
        !erro &&
        maquinas.length === 0 && (
          <div className="maquinas-empty">
            Nenhuma máquina cadastrada.
          </div>
        )}

      {!carregando &&
        maquinas.length > 0 && (
          <div className="maquinas-table-container">
            <table className="maquinas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número</th>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {maquinas.map((maquina) => (
                  <tr key={maquina.id}>
                    <td>{maquina.id}</td>

                    <td>{maquina.numero}</td>

                    <td>{maquina.nome}</td>

                    <td>
                      <span
                        className={
                          maquina.ativo
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {maquina.ativo
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() =>
                          abrirEdicao(maquina)
                        }
                      >
                        Editar
                      </button>
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

export default Maquinas;