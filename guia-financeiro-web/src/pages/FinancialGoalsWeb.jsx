import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "./FinancialGoalsWeb.css";

export default function FinancialGoalsWeb() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [aiLoading, setAiLoading] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [amountToTransfer, setAmountToTransfer] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedId = localStorage.getItem("user_id");
      if (!savedId) return;
      setUserId(savedId);

      const [goalsRes, accountsRes] = await Promise.all([
        api.get(`/financialGoal/user/${savedId}`),
        api.get(`/account/user/${savedId}`)
      ]);

      setGoals(goalsRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !targetAmount) return alert("Preencha os campos obrigatórios.");

    const payload = {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      targetDate: "2026-12-31",
      completed: false,
      user: userId
    };

    try {
      if (isEditing && selectedGoalId)
        await api.patch(`/financialGoal/${selectedGoalId}`, payload);
      else
        await api.post("/financialGoal", payload);

      closeModal();
      loadData();
    } catch {
      alert("Erro ao salvar objetivo.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja apagar esta meta permanentemente?")) {
      try {
        await api.delete(`/financialGoal/${id}`);
        loadData();
      } catch {
        alert("Erro ao excluir.");
      }
    }
  };

  const handleTransfer = async () => {
    if (!amountToTransfer || !selectedGoalId || !selectedAccountId)
      return alert("Selecione a conta e o valor do depósito.");

    const payload = {
      description: `Depósito para: ${name}`,
      amount: Number(amountToTransfer),
      type: "TRANSFER",
      category: "ENTRECONTAS",
      date: new Date().toISOString().split("T")[0],
      sourceAccount: selectedAccountId,
      financialGoal: selectedGoalId
    };

    try {
      await api.post("/transaction", payload);
      setTransferModalVisible(false);
      setAmountToTransfer("");
      setSelectedAccountId("");
      loadData();
    } catch {
      alert("Erro na transação.");
    }
  };

  const handleGetAiAdvice = async (goalId) => {
    setAiLoading(goalId);
    try {
      const res = await api.get(`/Ia/${goalId}`);
      alert(`💡 Consultor IA: ${res.data.advice}`);
    } catch {
      alert("IA indisponível no momento.");
    } finally {
      setAiLoading(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
  };

  if (loading) return <div className="loader">Buscando suas metas...</div>;

  return (
    <div className="container">
      <header className="header-web">
        <h1 className="title">Financeiro</h1>
        <p className="subtitle">Gerencie seus objetivos de longo prazo</p>
      </header>

      <button className="add-button" onClick={() => setModalVisible(true)}>
        <span className="icon-plus">⊕</span> Criar Objetivo
      </button>

      <div className="goals-grid">
        {goals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

          return (
            <div key={goal.id} className="card">
              <div className="card-header">
                <div className="goal-info">
                  <h3>{goal.name}</h3>
                  <span className="amounts">
                    R$ {goal.currentAmount.toLocaleString()} / R$ {goal.targetAmount.toLocaleString()}
                  </span>
                </div>

                <div className="actions">
                  <button className="icon-btn" onClick={() => {
                    setSelectedGoalId(goal.id);
                    setName(goal.name);
                    setTargetAmount(goal.targetAmount);
                    setCurrentAmount(goal.currentAmount);
                    setIsEditing(true);
                    setModalVisible(true);
                  }}>✎</button>
                  <button className="icon-btn delete" onClick={() => handleDelete(goal.id)}>🗑</button>
                </div>
              </div>

              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="percent-text">{percentage.toFixed(0)}%</span>
              </div>

              <div className="footer">
                <button className="deposit-btn" onClick={() => {
                  setSelectedGoalId(goal.id);
                  setName(goal.name);
                  setTransferModalVisible(true);
                }}>
                  ↗ Depositar
                </button>

                <button 
                  className={`ai-btn ${aiLoading === goal.id ? 'loading' : ''}`} 
                  onClick={() => handleGetAiAdvice(goal.id)}
                  disabled={aiLoading === goal.id}
                >
                  {aiLoading === goal.id ? "..." : "⚡ Consultar IA"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CRUD */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{isEditing ? "Editar" : "Novo"} Objetivo</h2>
            <div className="input-group">
              <label>Nome do Objetivo</label>
              <input placeholder="Ex: Viagem, Carro..." value={name} onChange={e => setName(e.target.value)} />
              
              <label>Valor Alvo (R$)</label>
              <input type="number" placeholder="0.00" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
              
              <label>Já possuo (R$)</label>
              <input type="number" placeholder="0.00" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>Confirmar</button>
              <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSFER */}
      {transferModalVisible && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Depositar em {name}</h2>
            <div className="input-group">
              <label>Origem do dinheiro</label>
              <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                <option value="">Selecione uma conta</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Saldo: R$ {acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>

              <label>Valor do depósito</label>
              <input
                type="number"
                placeholder="R$ 0,00"
                value={amountToTransfer}
                onChange={(e) => setAmountToTransfer(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleTransfer}>Confirmar Depósito</button>
              <button className="cancel-btn" onClick={() => setTransferModalVisible(false)}>Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}