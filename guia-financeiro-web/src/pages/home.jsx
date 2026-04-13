import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState("");
  const [gastoConta, setGastoConta] = useState(0);
  const [gastoCartao, setGastoCartao] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      navigate("/login");
      return;
    }
    loadData(userId);
  }, [navigate]);

  const loadData = async (userId) => {
    try {
      setLoading(true);
      const [userRes, balanceRes, gastoContaRes, gastoCartaoRes, streakRes] = await Promise.all([
        api.get(`/user/${userId}`),
        api.get(`/account/balance/${userId}`),
        api.get(`/transaction/gastoConta/${userId}`),
        api.get(`/transaction/gastoCartao/${userId}`),
        api.get(`/transaction/diasSemGasto/${userId}`)
      ]);

      const nome = userRes.data?.nome || userRes.data?.name || "Usuário";
      setUserName(nome);
      localStorage.setItem("user_name", nome);

      setBalance(Number(balanceRes.data) || 0);
      setGastoConta(Number(gastoContaRes.data) || 0);
      setGastoCartao(Number(gastoCartaoRes.data) || 0);
      setStreakDays(Number(streakRes.data) || 0);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setUserName(localStorage.getItem("user_name") || "Usuário");
    } finally {
      setLoading(false);
    }
  };

  const totalDisponivel = balance + gastoConta;
  const usoContaPercentage = totalDisponivel > 0 ? (gastoConta / totalDisponivel) * 100 : 0;

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="home-container">
      
      {/* 🔥 STREAK */}
      <div className="streak">
        🔥 {streakDays} dias de autocontrole
      </div>

      <h1 className="welcome">
        Bem-vindo, {userName}
      </h1>

      {/* 💰 SALDO */}
  {/* 💰 SALDO ESTILO MOBILE */}
<div className="saldo-card">
  <p className="saldo-label">Saldo Disponível</p>
  <h2 className="saldo-valor">
    R$ {balance.toLocaleString("pt-BR", { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}
  </h2>
</div>
      {/* 🤖 IA */}
      <div className="ai-card" onClick={() => navigate("/ai-tips")}>
        <div>
         <p className="ai-title">🤖 Análise do Consultor com IA</p>
        </div>
        <span>→</span>
      </div>

      {/* 📊 USO DA CONTA */}
      <div className="box">
        <div className="box-header">
          <p>Uso da Conta</p>
          <p>{usoContaPercentage.toFixed(0)}%</p>
        </div>

        <div className="progress">
          <div
            className="progress-value"
            style={{ 
              width: `${Math.min(usoContaPercentage, 100)}%`,
              // Lógica de cores igual ao mobile
              backgroundColor: usoContaPercentage >= 80 ? "#e74c3c" : usoContaPercentage >= 50 ? "#f1c40f" : "#2ecc71" 
            }}
          />
        </div>

        <p className="info">
  Gasto acumulado: R$ {gastoConta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
</p>
      </div>

      {/* 💳 CARTÃO */}
      <div className="box">
        <p>Gastos no Cartão</p>
        <h3 className="cartao">
          R$ {gastoCartao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h3>
      </div>

      {/* 📱 GRID */}
      <div className="grid">
        <button onClick={() => navigate("/accounts")}>🏦 Contas</button>
        <button onClick={() => navigate("/credit-cards")}>💳 Cartoes</button>
        <button onClick={() => navigate("/invoices")}>🗓️ Faturas</button>
        <button onClick={() => navigate("/financial-goals")}>🏳️ Metas</button>
      </div>

      {/* 📊 RELATÓRIOS */}
  <button className="full-btn" onClick={() => navigate("/reports")}>
  ✨ Insights
</button>

      {/* ➕ NOVO GASTO */}
      <button className="primary-btn" onClick={() => navigate("/CreateTransactionWeb")}>
        Registrar Gastos
      </button>

      {/* 🚪 LOGOUT */}
      <button className="logout" onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}>
        Sair
      </button>

    </div>
  );
}