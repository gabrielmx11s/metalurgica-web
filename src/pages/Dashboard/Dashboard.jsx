import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [indicadores, setIndicadores] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarIndicadores();
  }, []);

  async function carregarIndicadores() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(
        "/dashboard/indicadores-hoje"
      );

      setIndicadores(response.data);
    } catch (error) {
      console.error(
        "Erro ao carregar o dashboard:",
        error
      );

      if (error.response?.status === 401) {
        setErro(
          "Sua sessão expirou. Saia do sistema e entre novamente."
        );
      } else {
        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar os indicadores."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <section className="dashboard-page">
        <p className="dashboard-status">
          Carregando indicadores...
        </p>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Visão geral dos apontamentos de hoje.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={carregarIndicadores}
        >
          Atualizar
        </button>
      </header>

      {erro && (
        <div className="dashboard-error">
          {erro}
        </div>
      )}

      {indicadores && (
        <>
          <div className="dashboard-grid">
            <article className="dashboard-card">
              <span>Iniciados hoje</span>
              <strong>
                {indicadores.apontamentosIniciadosHoje ?? 0}
              </strong>
            </article>

            <article className="dashboard-card">
              <span>Finalizados hoje</span>
              <strong>
                {indicadores.apontamentosFinalizadosHoje ?? 0}
              </strong>
            </article>

            <article className="dashboard-card">
              <span>Em andamento</span>
              <strong>
                {indicadores.apontamentosEmAndamento ?? 0}
              </strong>
            </article>

            <article className="dashboard-card">
              <span>Pausados</span>
              <strong>
                {indicadores.apontamentosPausados ?? 0}
              </strong>
            </article>

            <article className="dashboard-card dashboard-card-wide">
              <span>Tempo produtivo hoje</span>
              <strong>
                {indicadores.tempoProdutivoFormatado ||
                  "00:00:00"}
              </strong>
            </article>

            <article className="dashboard-card dashboard-card-wide">
              <span>Tempo pausado hoje</span>
              <strong>
                {indicadores.tempoPausadoFormatado ||
                  "00:00:00"}
              </strong>
            </article>

            <article className="dashboard-card dashboard-card-wide">
              <span>
                Média por apontamento finalizado
              </span>
              <strong>
                {indicadores.mediaTempoFormatada ||
                  "00:00:00"}
              </strong>
            </article>
          </div>

          <div className="dashboard-highlights">
            <article className="highlight-card">
              <span>
                Máquina com maior tempo produtivo
              </span>

              <strong>
                {indicadores.maquinaComMaiorTempoProdutivo ||
                  "Nenhuma máquina"}
              </strong>
            </article>

            <article className="highlight-card">
              <span>
                Operador com maior tempo produtivo
              </span>

              <strong>
                {indicadores.operadorComMaiorTempoProdutivo ||
                  "Nenhum operador"}
              </strong>
            </article>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;