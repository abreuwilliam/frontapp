import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (forcedEmail) => {
    // Pega o e-mail do input ou do botão demo
    const emailFinal = (typeof forcedEmail === 'string' ? forcedEmail : email).trim().toLowerCase();

    if (!emailFinal) {
      alert("Por favor, insira um e-mail.");
      return;
    }

    try {
      // Faz a chamada para a API
      const response = await api.post("/user/login", {
        email: emailFinal,
      });

      // Captura o ID que vem do Banco de Dados (pode ser response.data.id ou response.data)
      // Ajuste conforme o formato do seu JSON de retorno
      const user = response.data;
      const userId = user.id;

      if (userId) {
        console.log("Login realizado com sucesso! ID do usuário:", userId);
        
        // Salva no localStorage para as outras páginas usarem
        localStorage.setItem("user_id", userId);
        localStorage.setItem("user_email", emailFinal); // Opcional: guardar o e-mail
        
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

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Guia de Bolso</h1>
        <p className="login-subtitle">Sua jornada financeira começa aqui</p>

        <label className="login-label">E-mail</label>
        <input
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button onClick={() => handleLogin()} className="login-button">
          Entrar na conta
        </button>

        {/* Botão de Demonstração agora dinâmico */}
        <button
          onClick={() => handleLogin("demostracao@email.com")}
          className="demo-button"
          style={{ 
            marginTop: '12px', 
            backgroundColor: '#64748b', 
            color: 'white',
            fontWeight: 'bold' 
          }}
        >
          Entrar em modo demo
        </button>

        <p className="footer-text">
          Ainda não tem conta? <span className="link-text" onClick={() => navigate("/cadastro")}>Cadastre-se</span>
        </p>
      </div>
    </div>
  );
}