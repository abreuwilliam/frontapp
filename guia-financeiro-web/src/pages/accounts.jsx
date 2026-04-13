import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./accounts.css";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados para Criação
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("CURRENT");

  // Estados dos Modais
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  const [transferData, setTransferData] = useState({ 
    amount: "", 
    sourceAccount: "", 
    destinationAccount: "" 
  });
  
  const [depositData, setDepositData] = useState({ 
    amount: "", 
    destinationAccount: "" 
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      setLoading(true);
      const [accountsRes, totalRes] = await Promise.all([
        api.get(`/account/user/${userId}`),
        api.get(`/account/balance/${userId}`)
      ]);

      setAccounts(accountsRes.data || []);
      
      // Captura o valor independente do formato da API
      const valorApi = typeof totalRes.data === 'object' ? 
        (totalRes.data.balance ?? totalRes.data.total ?? 0) : totalRes.data;
      
      setTotal(Number(valorApi) || 0);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const userId = localStorage.getItem("user_id");
    if (!name || !balance) return alert("Preencha os campos!");

    try {
      await api.post("/account", {
        name,
        balance: Number(balance.toString().replace(",", ".")),
        type,
        userId
      });
      setName(""); setBalance("");
      alert("Conta criada!");
      loadAccounts();
    } catch { alert("Erro ao criar conta."); }
  };

  const handleDeposit = async () => {
    if (!depositData.amount || !depositData.destinationAccount) return alert("Preencha tudo!");
    try {
      await api.post("/transaction", {
        amount: Number(depositData.amount.replace(",", ".")),
        type: "DEPOSIT",
        category: "DEPOSITO",
        date: new Date().toISOString().split("T")[0],
        destinationAccount: depositData.destinationAccount
      });
      setShowDeposit(false);
      setDepositData({ amount: "", destinationAccount: "" });
      loadAccounts();
    } catch { alert("Erro no depósito"); }
  };

  const handleTransfer = async () => {
    if (!transferData.amount || !transferData.sourceAccount || !transferData.destinationAccount) {
      return alert("Preencha todos os campos da transferência!");
    }
    try {
      await api.post("/transaction", {
        amount: Number(transferData.amount.replace(",", ".")),
        type: "TRANSFER",
        category: "ENTRECONTAS",
        date: new Date().toISOString().split("T")[0],
        sourceAccount: transferData.sourceAccount,
        destinationAccount: transferData.destinationAccount
      });
      setShowTransfer(false);
      setTransferData({ amount: "", sourceAccount: "", destinationAccount: "" });
      loadAccounts();
    } catch { alert("Erro na transferência"); }
  };

  if (loading) return <div className="loading-screen">Carregando...</div>;

  return (
    <div className="accounts-container">
      <h1 className="page-title">🏦 Suas Contas</h1>

      <div className="total-card">
        <p className="total-label">Patrimônio Total</p>
        <h2 className="total-value">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h2>
      </div>

      <div className="actions-grid">
        <button className="btn-action" onClick={() => setShowTransfer(true)}>🔃 Transferir</button>
        <button className="btn-action" onClick={() => setShowDeposit(true)}>📥 Depositar</button>
      </div>

      <div className="card-form">
        <h3>Nova Conta</h3>
        <input placeholder="Nome (Ex: Nubank)" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Saldo Inicial (R$)" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="CURRENT">Conta Corrente</option>
          <option value="SAVINGS">Poupança</option>
          <option value="INVESTMENT">Investimento</option>
        </select>
        <button className="btn-primary" onClick={handleCreate}>Criar Conta</button>
      </div>

      <div className="accounts-list">
        <p className="section-label">LISTAGEM</p>
        {accounts.map((acc) => (
          <div key={acc.id} className="item-card">
            <div className="item-info">
              <span className="item-name">{acc.name}</span>
              <span className="item-type">{acc.type}</span>
            </div>
            <span className="item-balance">
              R$ {Number(acc.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      {/* MODAL DEPÓSITO */}
      {showDeposit && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">📥 Depósito</h3>
            <input 
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="R$ 0,00" 
              value={depositData.amount} 
              onChange={(e) => setDepositData({...depositData, amount: e.target.value})} 
            />
            <select value={depositData.destinationAccount} onChange={(e) => setDepositData({...depositData, destinationAccount: e.target.value})}>
              <option value="">Selecionar Conta</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button className="btn-primary" onClick={handleDeposit}>Confirmar</button>
            <button className="btn-cancel" onClick={() => setShowDeposit(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL TRANSFERÊNCIA */}
      {showTransfer && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">🔃 Transferencia</h3>
            <input 
              type="text"
              inputMode="decimal"
              autoComplete="off"
              name="amount-transfer"
              placeholder="R$ 0,00" 
              value={transferData.amount} 
              onChange={(e) => setTransferData({...transferData, amount: e.target.value})} 
            />
            <select value={transferData.sourceAccount} onChange={(e) => setTransferData({...transferData, sourceAccount: e.target.value})}>
              <option value="">Conta de Origem</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={transferData.destinationAccount} onChange={(e) => setTransferData({...transferData, destinationAccount: e.target.value})}>
              <option value="">Conta de Destino</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button className="btn-primary" onClick={handleTransfer}>Confirmar</button>
            <button className="btn-cancel" onClick={() => setShowTransfer(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}