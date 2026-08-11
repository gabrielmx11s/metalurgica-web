import { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import "./Horarios.css";

function Horarios() {
  const [apontamentos, setApontamentos] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [filtroFuncionario, setFiltroFuncionario] =
    useState("");

  const [dataInicial, setDataInicial] =
    useState("");

  const [dataFinal, setDataFinal] =
    useState("");

  useEffect(() => {
    carregarHorarios();
  }, []);

  async function carregarHorarios() {
    try {
      setCarregando(true);
      setErro("");

      const response =
        await api.get("/apontamentos");

      setApontamentos(
        response.data
      );
    } catch (error) {
      console.error(
        "Erro ao carregar horários:",
        error
      );

      if (
        error.response?.status ===
        401
      ) {
        setErro(
          "Sua sessão expirou. Entre novamente."
        );
      } else {
        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar os horários."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  function formatarTempo(
    segundos
  ) {
    const total =
      Number(segundos || 0);

    const horas =
      Math.floor(
        total / 3600
      );

    const minutos =
      Math.floor(
        (total % 3600) / 60
      );

    return `${String(
      horas
    ).padStart(
      2,
      "0"
    )}h ${String(
      minutos
    ).padStart(
      2,
      "0"
    )}min`;
  }

  function formatarData(
    dataHora
  ) {
    if (!dataHora) {
      return "-";
    }

    return new Date(
      dataHora
    ).toLocaleDateString(
      "pt-BR"
    );
  }

  const funcionarios =
    useMemo(() => {
      const nomes =
        apontamentos
          .map(
            (apontamento) =>
              apontamento
                .funcionarioNome
          )
          .filter(Boolean);

      return [
        ...new Set(nomes),
      ].sort();
    }, [apontamentos]);

  const horarios =
    useMemo(() => {
      return apontamentos
        .filter(
          (apontamento) =>
            apontamento.status ===
            "FINALIZADO"
        )

        .filter(
          (apontamento) => {
            if (
              !filtroFuncionario
            ) {
              return true;
            }

            return (
              apontamento
                .funcionarioNome ===
              filtroFuncionario
            );
          }
        )

        .filter(
          (apontamento) => {
            if (
              !apontamento.inicio
            ) {
              return false;
            }

            const dataApontamento =
              apontamento.inicio.slice(
                0,
                10
              );

            if (
              dataInicial &&
              dataApontamento <
                dataInicial
            ) {
              return false;
            }

            if (
              dataFinal &&
              dataApontamento >
                dataFinal
            ) {
              return false;
            }

            return true;
          }
        )

        .map(
          (apontamento) => {
            const normal =
              Number(
                apontamento
                  .segundosNormais ||
                  0
              );

            const extra =
              Number(
                apontamento
                  .segundosExtras ||
                  0
              );

            return {
              ...apontamento,

              segundosTotais:
                normal + extra,
            };
          }
        );
    }, [
      apontamentos,
      filtroFuncionario,
      dataInicial,
      dataFinal,
    ]);

  const totais =
    useMemo(() => {
      return horarios.reduce(
        (
          acumulador,
          apontamento
        ) => {
          acumulador.normal +=
            Number(
              apontamento
                .segundosNormais ||
                0
            );

          acumulador.extra +=
            Number(
              apontamento
                .segundosExtras ||
                0
            );

          acumulador.total +=
            Number(
              apontamento
                .segundosTotais ||
                0
            );

          return acumulador;
        },
        {
          normal: 0,
          extra: 0,
          total: 0,
        }
      );
    }, [horarios]);

  function limparFiltros() {
    setFiltroFuncionario("");
    setDataInicial("");
    setDataFinal("");
  }

  return (
    <section className="horarios-page">
      <header className="horarios-header">
        <div>
          <h1>
            Horários
          </h1>

          <p>
            Controle de horas normais e extras dos funcionários.
          </p>
        </div>

        <button
          type="button"
          onClick={
            carregarHorarios
          }
        >
          Atualizar
        </button>
      </header>

      <div className="horarios-filtros">
        <div className="horarios-filtro">
          <label>
            Funcionário
          </label>

          <select
            value={
              filtroFuncionario
            }
            onChange={(event) =>
              setFiltroFuncionario(
                event.target.value
              )
            }
          >
            <option value="">
              Todos
            </option>

            {funcionarios.map(
              (nome) => (
                <option
                  key={nome}
                  value={nome}
                >
                  {nome}
                </option>
              )
            )}
          </select>
        </div>

        <div className="horarios-filtro">
          <label>
            Data inicial
          </label>

          <input
            type="date"
            value={dataInicial}
            onChange={(event) =>
              setDataInicial(
                event.target.value
              )
            }
          />
        </div>

        <div className="horarios-filtro">
          <label>
            Data final
          </label>

          <input
            type="date"
            value={dataFinal}
            onChange={(event) =>
              setDataFinal(
                event.target.value
              )
            }
          />
        </div>

        <button
          type="button"
          className="horarios-limpar"
          onClick={
            limparFiltros
          }
        >
          Limpar filtros
        </button>
      </div>

      {!carregando &&
        !erro && (
          <div className="horarios-resumo">
            <article>
              <span>
                Horas normais
              </span>

              <strong>
                {formatarTempo(
                  totais.normal
                )}
              </strong>
            </article>

            <article>
              <span>
                Horas extras
              </span>

              <strong className="horarios-extra-resumo">
                {formatarTempo(
                  totais.extra
                )}
              </strong>
            </article>

            <article>
              <span>
                Total trabalhado
              </span>

              <strong>
                {formatarTempo(
                  totais.total
                )}
              </strong>
            </article>
          </div>
        )}

      {carregando && (
        <div className="horarios-mensagem">
          Carregando horários...
        </div>
      )}

      {erro && (
        <div className="horarios-error">
          {erro}
        </div>
      )}

      {!carregando &&
        !erro &&
        horarios.length ===
          0 && (
          <div className="horarios-vazio">
            Nenhum horário encontrado para os filtros selecionados.
          </div>
        )}

      {!carregando &&
        !erro &&
        horarios.length >
          0 && (
          <div className="horarios-tabela-container">
            <table className="horarios-table">
              <thead>
                <tr>
                  <th>
                    Funcionário
                  </th>

                  <th>
                    OP
                  </th>

                  <th>
                    Máquina
                  </th>

                  <th>
                    Data
                  </th>

                  <th>
                    Normal
                  </th>

                  <th>
                    Extra
                  </th>

                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {horarios.map(
                  (
                    apontamento
                  ) => (
                    <tr
                      key={
                        apontamento.id
                      }
                    >
                      <td>
                        {apontamento.funcionarioNome ||
                          "-"}
                      </td>

                      <td>
                        {apontamento.numeroOp ||
                          "-"}
                      </td>

                      <td>
                        {apontamento.maquinaNumero &&
                        apontamento.maquinaNome
                          ? `${apontamento.maquinaNumero} - ${apontamento.maquinaNome}`
                          : "-"}
                      </td>

                      <td>
                        {formatarData(
                          apontamento.inicio
                        )}
                      </td>

                      <td>
                        <span className="horario-normal">
                          {formatarTempo(
                            apontamento.segundosNormais
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            apontamento.segundosExtras >
                            0
                              ? "horario-extra horario-extra-ativo"
                              : "horario-extra"
                          }
                        >
                          {formatarTempo(
                            apontamento.segundosExtras
                          )}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatarTempo(
                            apontamento.segundosTotais
                          )}
                        </strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
    </section>
  );
}

export default Horarios;