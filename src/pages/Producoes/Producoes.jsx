import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Producoes.css";

const formularioInicial = {
  numeroOp: "",
  empresa: "",
  desenho: "",
  quantidade: "",
  status: "ABERTA",
};

function Producoes() {
  const [producoes, setProducoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [modoFormulario, setModoFormulario] =
    useState("cadastrar");

  const [producaoEditandoId, setProducaoEditandoId] =
    useState(null);

  const [formulario, setFormulario] =
    useState(formularioInicial);

  useEffect(() => {
    carregarProducoes();
  }, []);

  async function carregarProducoes() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get("/producoes");

      setProducoes(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar produções:",
        error
      );

      if (error.response?.status === 401) {
        setErro(
          "Sua sessão expirou. Entre novamente."
        );
      } else {
        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar as produções."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  function abrirCadastro() {
    setModoFormulario("cadastrar");
    setProducaoEditandoId(null);
    setFormulario(formularioInicial);

    setErro("");
    setSucesso("");
    setMostrarFormulario(true);
  }

  function abrirEdicao(producao) {
    setModoFormulario("editar");
    setProducaoEditandoId(producao.id);

    setFormulario({
      numeroOp: producao.numeroOp || "",
      empresa: producao.empresa || "",
      desenho: producao.desenho || "",
      quantidade:
        producao.quantidade?.toString() || "",
      status: producao.status || "ABERTA",
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
    setProducaoEditandoId(null);
    setFormulario(formularioInicial);
    setErro("");
  }

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function validarFormulario() {
    if (!formulario.numeroOp.trim()) {
      setErro("O número da OP é obrigatório.");
      return false;
    }

    if (!formulario.empresa.trim()) {
      setErro("O nome da empresa é obrigatório.");
      return false;
    }

    if (!formulario.desenho.trim()) {
      setErro("O número do desenho é obrigatório.");
      return false;
    }

    const quantidade =
      Number(formulario.quantidade);

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      setErro(
        "A quantidade deve ser um número inteiro maior que zero."
      );

      return false;
    }

    return true;
  }

  async function salvarProducao(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!validarFormulario()) {
      return;
    }

    const dados = {
      numeroOp: formulario.numeroOp.trim(),
      empresa: formulario.empresa.trim(),
      desenho: formulario.desenho.trim(),
      quantidade: Number(
        formulario.quantidade
      ),
      status: formulario.status,
    };

    try {
      setSalvando(true);

      if (modoFormulario === "editar") {
        await api.put(
          `/producoes/${producaoEditandoId}`,
          dados
        );

        setSucesso(
          "Produção atualizada com sucesso."
        );
      } else {
        await api.post("/producoes", dados);

        setSucesso(
          "Produção cadastrada com sucesso."
        );
      }

      setMostrarFormulario(false);
      setProducaoEditandoId(null);
      setFormulario(formularioInicial);

      await carregarProducoes();
    } catch (error) {
      console.error(
        "Erro ao salvar produção:",
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
            "Não foi possível salvar a produção."
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  function formatarStatus(status) {
    if (!status) {
      return "-";
    }

    return status.replaceAll("_", " ");
  }

  function obterClasseStatus(status) {
    switch (status) {
      case "ABERTA":
        return "producao-status producao-status-aberta";

      case "EM_PRODUCAO":
        return "producao-status producao-status-producao";

      case "AGUARDANDO_CONTINUIDADE":
        return "producao-status producao-status-aguardando";

      case "FINALIZADA":
        return "producao-status producao-status-finalizada";

      case "CANCELADA":
        return "producao-status producao-status-cancelada";

      default:
        return "producao-status";
    }
  }

  return (
    <section className="producoes-page">
      <header className="producoes-header">
        <div>
          <h1>Produções</h1>

          <p>
            Gerencie as Ordens de Produção
            disponíveis para os operadores.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirCadastro}
        >
          + Nova produção
        </button>
      </header>

      {sucesso && (
        <div className="producoes-success">
          {sucesso}
        </div>
      )}

      {erro && !mostrarFormulario && (
        <div className="producoes-error">
          {erro}
        </div>
      )}

      {mostrarFormulario && (
        <div className="producoes-modal-overlay">
          <section className="producoes-modal">
            <header className="producoes-modal-header">
              <div>
                <h2>
                  {modoFormulario === "editar"
                    ? "Editar produção"
                    : "Nova produção"}
                </h2>

                <p>
                  {modoFormulario === "editar"
                    ? "Atualize os dados da produção."
                    : "Cadastre os dados da OP."}
                </p>
              </div>

              <button
                type="button"
                className="producoes-close-button"
                onClick={fecharFormulario}
                disabled={salvando}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </header>

            <form
              className="producoes-form"
              onSubmit={salvarProducao}
            >
              <div className="producoes-field">
                <label htmlFor="numeroOp">
                  Número da OP
                </label>

                <input
                  id="numeroOp"
                  name="numeroOp"
                  type="text"
                  value={formulario.numeroOp}
                  onChange={atualizarCampo}
                  placeholder="Ex.: 24580"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div className="producoes-field">
                <label htmlFor="empresa">
                  Empresa
                </label>

                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  value={formulario.empresa}
                  onChange={atualizarCampo}
                  placeholder="Ex.: John Deere"
                  maxLength={150}
                />
              </div>

              <div className="producoes-field">
                <label htmlFor="desenho">
                  Número do desenho
                </label>

                <input
                  id="desenho"
                  name="desenho"
                  type="text"
                  value={formulario.desenho}
                  onChange={atualizarCampo}
                  placeholder="Ex.: DT-5478"
                  maxLength={100}
                />
              </div>

              <div className="producoes-field">
                <label htmlFor="quantidade">
                  Quantidade
                </label>

                <input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  value={formulario.quantidade}
                  onChange={atualizarCampo}
                  placeholder="Ex.: 20"
                />
              </div>

              <div className="producoes-field">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formulario.status}
                  onChange={atualizarCampo}
                >
                  <option value="ABERTA">
                    Aberta
                  </option>

                  <option value="EM_PRODUCAO">
                    Em produção
                  </option>

                  <option value="AGUARDANDO_CONTINUIDADE">
                    Aguardando continuidade
                  </option>

                  <option value="FINALIZADA">
                    Finalizada
                  </option>

                  <option value="CANCELADA">
                    Cancelada
                  </option>
                </select>
              </div>

              {erro && (
                <div className="producoes-error">
                  {erro}
                </div>
              )}

              <div className="producoes-form-actions">
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
        <div className="producoes-message">
          Carregando produções...
        </div>
      )}

      {!carregando &&
        !erro &&
        producoes.length === 0 && (
          <div className="producoes-empty">
            Nenhuma produção cadastrada.
          </div>
        )}

      {!carregando &&
        producoes.length > 0 && (
          <div className="producoes-table-container">
            <table className="producoes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>OP</th>
                  <th>Empresa</th>
                  <th>Desenho</th>
                  <th>Quantidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {producoes.map((producao) => (
                  <tr key={producao.id}>
                    <td>{producao.id}</td>

                    <td>{producao.numeroOp}</td>

                    <td>{producao.empresa}</td>

                    <td>{producao.desenho}</td>

                    <td>
                      {producao.quantidade}
                    </td>

                    <td>
                      <span
                        className={obterClasseStatus(
                          producao.status
                        )}
                      >
                        {formatarStatus(
                          producao.status
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() =>
                          abrirEdicao(producao)
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

export default Producoes;