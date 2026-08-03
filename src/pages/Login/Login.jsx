import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

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
    <main>
      <h1>Sistema de Apontamentos</h1>
      <p>Entre com o PIN do funcionário.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="pin">PIN</label>

        <input
          id="pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(event) => {
            const somenteNumeros = event.target.value.replace(/\D/g, "");
            setPin(somenteNumeros);
          }}
          placeholder="Digite 4 números"
          autoComplete="off"
        />

        {erro && <p>{erro}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

export default Login;