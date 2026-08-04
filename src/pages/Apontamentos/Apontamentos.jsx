import { useEffect, useState } from "react";

import api from "../../services/api";
import "./Apontamentos.css";

function Apontamentos() {
  const [apontamentos, setApontamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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
      console.error("Erro ao carregar apontamentos:", error);

      if (error.response?.status === 401) {
        setErro("Sua sessão expirou. Entre novamente.");
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

    return new Date(dataHora).toLocaleString("pt-BR");
  }

  function formatarStatus(status) {
    if (!status) {
      return "-";
    }

    return status.replaceAll("_", " ");
  }

  return (
    <section className="apontamentos-page">
      <header className="apontamentos-header">
        <div>
          <h1>Apontamentos</h1>
          <p>Histórico dos trabalhos registrados.</p>
        </div>

        <button type="button" onClick={carregarApontamentos}>
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
                </tr>
              </thead>

              <tbody>
                {apontamentos.map((apontamento) => (
                  <tr key={apontamento.id}>
                    <td>{apontamento.id}</td>

                    <td>
                      {apontamento.funcionarioNome ||
                        apontamento.funcionario?.nome ||
                        "-"}
                    </td>

                    <td>
                      {apontamento.maquinaNumero &&
                      apontamento.maquinaNome
                        ? `${apontamento.maquinaNumero} - ${apontamento.maquinaNome}`
                        : apontamento.maquina?.numero
                          ? `${apontamento.maquina.numero} - ${apontamento.maquina.nome}`
                          : "-"}
                    </td>

                    <td>
                      {formatarData(apontamento.inicio)}
                    </td>

                    <td>
                      {formatarData(apontamento.fim)}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${apontamento.status?.toLowerCase()}`}
                      >
                        {formatarStatus(apontamento.status)}
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

export default Apontamentos;