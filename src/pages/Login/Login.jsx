import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./Login.css";

function Login() {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!/^\d{4}$/.test(pin)) {
      setErro("Digite um PIN com exatamente 4 números.");
      return;
    }

    try {
      setCarregando(true);

      const response = await api.post("/auth/login", {
        pin,
      });

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "funcionario",
        JSON.stringify({
          id: response.data.funcionarioId,
          nome: response.data.nome,
          cargo: response.data.cargo,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      const mensagem =
        error.response?.data?.erro ||
        error.response?.data?.mensagem ||
        "Não foi possível realizar o login.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-header">
          <h1>TORNESUL</h1>
          <h2>Sistema de Apontamentos</h2>
          <p>Digite o PIN do funcionário para acessar.</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="pin">PIN</label>

          <input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(event) => {
              const somenteNumeros =
                event.target.value.replace(/\D/g, "");

              setPin(somenteNumeros);
            }}
            placeholder="••••"
            autoComplete="off"
            autoFocus
          />

          {erro && <p className="login-error">{erro}</p>}

          <button
            className="login-button"
            type="submit"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;