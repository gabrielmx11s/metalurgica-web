import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Operacao.css";

function Operacao() {
  const [apontamento, setApontamento] =
    useState(null);

  const [maquinas, setMaquinas] =
    useState([]);

  const [numeroMaquina, setNumeroMaquina] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [processando, setProcessando] =
    useState(false);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    await Promise.all([
      carregarApontamentoAtual(),
      carregarMaquinas(),
    ]);
  }

  async function carregarApontamentoAtual() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(
        "/apontamentos/atual"
      );

      if (response.status === 204) {
        setApontamento(null);
        return;
      }

      setApontamento(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar apontamento:",
        error
      );

      tratarErro(
        error,
        "Não foi possível carregar o apontamento atual."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarMaquinas() {
    try {
      const response = await api.get(
        "/maquinas"
      );

      const maquinasAtivas =
        response.data.filter(
          (maquina) => maquina.ativo
        );

      setMaquinas(maquinasAtivas);
    } catch (error) {
      console.error(
        "Erro ao carregar máquinas:",
        error
      );
    }
  }

  function abrirModal() {
    setNumeroMaquina("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (processando) {
      return;
    }

    setModalAberto(false);
    setNumeroMaquina("");
    setErro("");
  }

  async function iniciarApontamento(event) {
    event.preventDefault();

    if (!numeroMaquina) {
      setErro(
        "Selecione uma máquina."
      );

      return;
    }

    try {
      setProcessando(true);
      setErro("");
      setSucesso("");

      await api.post(
        "/apontamentos/iniciar",
        {
          numeroMaquina,
        }
      );

      setModalAberto(false);
      setNumeroMaquina("");

      setSucesso(
        "Apontamento iniciado com sucesso."
      );

      await carregarApontamentoAtual();
    } catch (error) {
      console.error(
        "Erro ao iniciar apontamento:",
        error
      );

      tratarErro(
        error,
        "Não foi possível iniciar o apontamento."
      );
    } finally {
      setProcessando(false);
    }
  }

  async function executarAcao(acao) {
    if (!apontamento?.id || processando) {
      return;
    }

    const mensagens = {
      pausar:
        "Apontamento pausado com sucesso.",
      retomar:
        "Apontamento retomado com sucesso.",
      finalizar:
        "Apontamento finalizado com sucesso.",
    };

    try {
      setProcessando(true);
      setErro("");
      setSucesso("");

      await api.put(
        `/apontamentos/${apontamento.id}/${acao}`
      );

      setSucesso(mensagens[acao]);

      await carregarApontamentoAtual();
    } catch (error) {
      console.error(
        `Erro ao ${acao}:`,
        error
      );

      tratarErro(
        error,
        `Não foi possível ${acao} o apontamento.`
      );
    } finally {
      setProcessando(false);
    }
  }

  function tratarErro(
    error,
    mensagemPadrao
  ) {
    if (error.response?.status === 401) {
      setErro(
        "Sua sessão expirou. Entre novamente."
      );

      return;
    }

    setErro(
      error.response?.data?.erro ||
        mensagemPadrao
    );
  }

  function formatarData(dataHora) {
    if (!dataHora) {
      return "-";
    }

    return new Date(
      dataHora
    ).toLocaleString("pt-BR");
  }

  function formatarStatus(status) {
    if (!status) {
      return "-";
    }

    return status.replaceAll("_", " ");
  }

  if (carregando) {
    return (
      <section className="operacao-page">
        <div className="operacao-card">
          <div className="operacao-loading">
            Carregando operação...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="operacao-page">
      <div className="operacao-card">
        <header className="operacao-header">
          <div>
            <h1>Operação</h1>

            <p>
              Controle do apontamento de
              produção.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={carregarApontamentoAtual}
            disabled={processando}
          >
            Atualizar
          </button>
        </header>

        {sucesso && (
          <div className="operacao-success">
            {sucesso}
          </div>
        )}

        {erro && !modalAberto && (
          <div className="operacao-error">
            {erro}
          </div>
        )}

        {!apontamento && !erro && (
          <div className="operacao-sem-apontamento">
            <div className="operacao-empty-icon">
              ▶
            </div>

            <h2>Nenhum trabalho ativo</h2>

            <p>
              Você não possui apontamento em
              andamento ou pausado.
            </p>

            <button
              type="button"
              className="btn btn-primary operacao-start-button"
              onClick={abrirModal}
            >
              Iniciar apontamento
            </button>
          </div>
        )}

        {apontamento && (
          <>
            <div className="operacao-status-area">
              <span
                className={
                  apontamento.status ===
                  "EM_ANDAMENTO"
                    ? "operacao-status operacao-status-andamento"
                    : "operacao-status operacao-status-pausado"
                }
              >
                {formatarStatus(
                  apontamento.status
                )}
              </span>
            </div>

            <div className="operacao-info-grid">
              <article className="operacao-info-card">
                <span>Funcionário</span>

                <strong>
                  {apontamento.funcionarioNome ||
                    "-"}
                </strong>
              </article>

              <article className="operacao-info-card">
                <span>Máquina</span>

                <strong>
                  {apontamento.maquinaNumero &&
                  apontamento.maquinaNome
                    ? `${apontamento.maquinaNumero} - ${apontamento.maquinaNome}`
                    : "-"}
                </strong>
              </article>

              <article className="operacao-info-card">
                <span>Início</span>

                <strong>
                  {formatarData(
                    apontamento.inicio
                  )}
                </strong>
              </article>

              <article className="operacao-info-card">
                <span>ID do apontamento</span>

                <strong>
                  #{apontamento.id}
                </strong>
              </article>
            </div>

            {apontamento.status ===
              "PAUSADO" && (
              <div className="operacao-pausa-info">
                <span>Pausado desde</span>

                <strong>
                  {formatarData(
                    apontamento.inicioPausa
                  )}
                </strong>
              </div>
            )}

            <div className="operacao-actions">
              {apontamento.status ===
                "EM_ANDAMENTO" && (
                <button
                  type="button"
                  className="btn operacao-pause-button"
                  onClick={() =>
                    executarAcao("pausar")
                  }
                  disabled={processando}
                >
                  {processando
                    ? "Processando..."
                    : "Pausar"}
                </button>
              )}

              {apontamento.status ===
                "PAUSADO" && (
                <button
                  type="button"
                  className="btn operacao-resume-button"
                  onClick={() =>
                    executarAcao("retomar")
                  }
                  disabled={processando}
                >
                  {processando
                    ? "Processando..."
                    : "Retomar"}
                </button>
              )}

              <button
                type="button"
                className="btn btn-danger"
                onClick={() =>
                  executarAcao("finalizar")
                }
                disabled={processando}
              >
                {processando
                  ? "Processando..."
                  : "Finalizar"}
              </button>
            </div>
          </>
        )}
      </div>

      {modalAberto && (
        <div className="operacao-modal-overlay">
          <section className="operacao-modal">
            <header className="operacao-modal-header">
              <div>
                <h2>Novo apontamento</h2>

                <p>
                  Selecione a máquina para iniciar.
                </p>
              </div>

              <button
                type="button"
                className="operacao-modal-close"
                onClick={fecharModal}
                disabled={processando}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </header>

            <form
              onSubmit={iniciarApontamento}
            >
              <div className="operacao-field">
                <label htmlFor="numeroMaquina">
                  Máquina
                </label>

                <select
                  id="numeroMaquina"
                  value={numeroMaquina}
                  onChange={(event) =>
                    setNumeroMaquina(
                      event.target.value
                    )
                  }
                  autoFocus
                >
                  <option value="">
                    Selecione uma máquina
                  </option>

                  {maquinas.map((maquina) => (
                    <option
                      key={maquina.id}
                      value={maquina.numero}
                    >
                      {maquina.numero} -{" "}
                      {maquina.nome}
                    </option>
                  ))}
                </select>
              </div>

              {erro && (
                <div className="operacao-error">
                  {erro}
                </div>
              )}

              <div className="operacao-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={fecharModal}
                  disabled={processando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processando}
                >
                  {processando
                    ? "Iniciando..."
                    : "Iniciar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default Operacao;