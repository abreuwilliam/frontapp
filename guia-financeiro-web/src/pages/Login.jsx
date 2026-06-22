import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const emailFinal = email.trim().toLowerCase();

    if (!emailFinal) {
      alert("Por favor, insira um e-mail.");
      return;
    }

    try {
      const response = await api.post("/user/login", {
        email: emailFinal,
      });

      const user = response.data;
      const userId = user.id;

      if (userId) {
        localStorage.setItem("user_id", userId);
        localStorage.setItem("user_email", emailFinal);
        navigate("/home");
      } else {
        alert("Erro ao identificar o ID do usuário.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.response && error.response.status === 404) {
        alert("E-mail não cadastrado. Crie uma conta primeiro.");
      } else {
        alert("Erro na conexão com o servidor.");
      }
    }
  };

  // Nova função para apenas preencher o campo
  const preencherDemo = () => {
    setEmail("demostracao@email.com");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Guia de Bolso</h1>
        <p className="login-subtitle">Essa é uma versão web de um Aplicativo</p>
       

        <label className="login-label">E-mail</label>
        <input
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button onClick={handleLogin} className="login-button">
          Entrar na conta
        </button>

        {/* Botão Demo alterado para apenas preencher o estado */}
        <button
          onClick={preencherDemo}
          className="demo-button"
          style={{ 
            marginTop: '12px', 
            backgroundColor: '#64748b', 
            color: 'white',
            fontWeight: 'bold',
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Usar conta demo
        </button>

        <p className="footer-text">
          Ainda não tem conta? <span className="link-text" onClick={() => navigate("/cadastro")}>Cadastre-se</span>
        </p>
      </div>
    </div>
  );
}