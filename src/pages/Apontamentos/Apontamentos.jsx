import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Apontamentos.css";

function Apontamentos() {
  const [apontamentos, setApontamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [apontamentoSelecionado, setApontamentoSelecionado] =
    useState(null);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [motivo, setMotivo] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    carregarApontamentos();
  }, []);

  async function carregarApontamentos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get("/apontamentos");

      setApontamentos(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar apontamentos:",
        error
      );

      if (error.response?.status === 401) {
        setErro(
          "Sua sessão expirou. Entre novamente."
        );
      } else {
        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar os apontamentos."
        );
      }
    } finally {
      setCarregando(false);
    }
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

    return status.replaceAll(
      "_",
      " "
    );
  }

  function converterParaInput(dataHora) {
    if (!dataHora) {
      return "";
    }

    return dataHora.slice(0, 16);
  }

  function abrirModal(apontamento) {
    setApontamentoSelecionado(
      apontamento
    );

    setInicio(
      converterParaInput(
        apontamento.inicio
      )
    );

    setFim(
      converterParaInput(
        apontamento.fim
      )
    );

    setMotivo("");
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
    setApontamentoSelecionado(null);
    setInicio("");
    setFim("");
    setMotivo("");
    setErroModal("");
  }

  async function salvarCorrecao(event) {
    event.preventDefault();

    if (!inicio || !fim) {
      setErroModal(
        "Informe os horários de início e fim."
      );

      return;
    }

    if (!motivo.trim()) {
      setErroModal(
        "Informe o motivo da correção."
      );

      return;
    }

    if (
      new Date(inicio) >=
      new Date(fim)
    ) {
      setErroModal(
        "O horário de início deve ser anterior ao horário de fim."
      );

      return;
    }

    try {
      setSalvando(true);
      setErroModal("");

      await api.put(
        `/apontamentos/${apontamentoSelecionado.id}/corrigir-horario`,
        {
          inicio: `${inicio}:00`,
          fim: `${fim}:00`,
          motivo: motivo.trim(),
        }
      );

      setModalAberto(false);
      setApontamentoSelecionado(null);
      setInicio("");
      setFim("");
      setMotivo("");

      await carregarApontamentos();
    } catch (error) {
      console.error(
        "Erro ao corrigir horário:",
        error
      );

      if (error.response?.status === 401) {
        setErroModal(
          "Sua sessão expirou. Entre novamente."
        );
      } else {
        setErroModal(
          error.response?.data?.erro ||
            "Não foi possível corrigir o horário."
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="apontamentos-page">
      <header className="apontamentos-header">
        <div>
          <h1>Apontamentos</h1>

          <p>
            Histórico dos trabalhos registrados.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarApontamentos}
        >
          Atualizar
        </button>
      </header>

      {carregando && (
        <p className="apontamentos-mensagem">
          Carregando apontamentos...
        </p>
      )}

      {erro && (
        <div className="apontamentos-error">
          {erro}
        </div>
      )}

      {!carregando &&
        !erro &&
        apontamentos.length === 0 && (
          <div className="apontamentos-vazio">
            Nenhum apontamento encontrado.
          </div>
        )}

      {!carregando &&
        !erro &&
        apontamentos.length > 0 && (
          <div className="tabela-container">
            <table className="apontamentos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Funcionário</th>
                  <th>Máquina</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {apontamentos.map(
                  (apontamento) => (
                    <tr key={apontamento.id}>
                      <td>
                        {apontamento.id}
                      </td>

                      <td>
                        {apontamento.funcionarioNome ||
                          apontamento
                            .funcionario
                            ?.nome ||
                          "-"}
                      </td>

                      <td>
                        {apontamento.maquinaNumero &&
                        apontamento.maquinaNome
                          ? `${apontamento.maquinaNumero} - ${apontamento.maquinaNome}`
                          : apontamento.maquina
                              ?.numero
                            ? `${apontamento.maquina.numero} - ${apontamento.maquina.nome}`
                            : "-"}
                      </td>

                      <td>
                        {formatarData(
                          apontamento.inicio
                        )}
                      </td>

                      <td>
                        {formatarData(
                          apontamento.fim
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${apontamento.status?.toLowerCase()}`}
                        >
                          {formatarStatus(
                            apontamento.status
                          )}
                        </span>
                      </td>

                      <td>
                        {apontamento.status ===
                        "FINALIZADO" ? (
                          <button
                            type="button"
                            className="botao-corrigir"
                            onClick={() =>
                              abrirModal(
                                apontamento
                              )
                            }
                          >
                            Editar
                          </button>
                        ) : (
                          <span className="acao-indisponivel">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

      {modalAberto &&
        apontamentoSelecionado && (
          <div
            className="modal-overlay"
            onMouseDown={fecharModal}
          >
            <div
              className="modal-correcao"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-correcao-header">
                <div>
                  <h2>
                    Corrigir horário
                  </h2>

                  <p>
                    Apontamento #
                    {
                      apontamentoSelecionado.id
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-fechar"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  ×
                </button>
              </div>

              <div className="modal-info">
                <div>
                  <span>
                    Funcionário
                  </span>

                  <strong>
                    {apontamentoSelecionado.funcionarioNome ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Máquina
                  </span>

                  <strong>
                    {apontamentoSelecionado.maquinaNumero &&
                    apontamentoSelecionado.maquinaNome
                      ? `${apontamentoSelecionado.maquinaNumero} - ${apontamentoSelecionado.maquinaNome}`
                      : "-"}
                  </strong>
                </div>
              </div>

              <form
                onSubmit={salvarCorrecao}
                className="form-correcao"
              >
                <div className="campo-correcao">
                  <label htmlFor="inicio">
                    Início
                  </label>

                  <input
                    id="inicio"
                    type="datetime-local"
                    value={inicio}
                    onChange={(event) =>
                      setInicio(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="campo-correcao">
                  <label htmlFor="fim">
                    Fim
                  </label>

                  <input
                    id="fim"
                    type="datetime-local"
                    value={fim}
                    onChange={(event) =>
                      setFim(
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="campo-correcao campo-motivo">
                  <label htmlFor="motivo">
                    Motivo da correção
                  </label>

                  <textarea
                    id="motivo"
                    value={motivo}
                    onChange={(event) =>
                      setMotivo(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Operador esqueceu de encerrar o período."
                    maxLength={500}
                    required
                  />
                </div>

                {erroModal && (
                  <div className="modal-error">
                    {erroModal}
                  </div>
                )}

                <div className="modal-acoes">
                  <button
                    type="button"
                    className="botao-cancelar"
                    onClick={fecharModal}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="botao-salvar"
                    disabled={salvando}
                  >
                    {salvando
                      ? "Salvando..."
                      : "Salvar correção"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
}

export default Apontamentos;