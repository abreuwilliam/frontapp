import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "./CreateTransactionWeb.css";

// Mapeamento opcional de ícones específicos para os subitens ficarem lindos
const CATEGORY_ICONS = {
  ALIMENTACAO: "🍕", SUPERMERCADO: "🛒", RESTAURANTE: "🍔", PADARIA: "🥐", BEBIDA_ALCOOLICA: "🍺",
  COMBUSTIVEL: "⛽", UBER: "🚗", MANUTENCAO_VEICULO: "🔧", TRANSPORTE_PUBLICO: "🚌",
  ALUGUEL: "🔑", CONDOMINIO: "🏢", ENERGIA: "💡", AGUA: "🚰", INTERNET: "🌐", GAS: "🔥",
  CINEMA: "🍿", STREAMING: "📺", VIAGEM: "✈️", SHOW: "🎸", HOBBIES: "🎨", LIVROS: "📚",
  FARMACIA: "🏥", PLANO_DE_SAUDE: "🛡️", CONSULTA_MEDICA: "🩺", ACADEMIA: "💪",
  CURSO: "🎓", PRESENTES: "🎁", ELETRONICOS: "💻", ROUPAS: "👕", PAGAMENTO_FATURA: "📄", FILHOS: "👶", PETS: "🐶",
  OUTROS: "📦"
};

const CATEGORY_GROUPS = [
  { label: "Alimentação", icon: "🍴", items: ["ALIMENTACAO", "SUPERMERCADO", "RESTAURANTE", "PADARIA", "BEBIDA_ALCOOLICA"] },
  { label: "Transporte", icon: "🚗", items: ["COMBUSTIVEL", "UBER", "MANUTENCAO_VEICULO", "TRANSPORTE_PUBLICO"] },
  { label: "Casa", icon: "🏠", items: ["ALUGUEL", "CONDOMINIO", "ENERGIA", "AGUA", "INTERNET", "GAS"] },
  { label: "Lazer", icon: "🎭", items: ["CINEMA", "STREAMING", "VIAGEM", "SHOW", "HOBBIES", "LIVROS"] },
  { label: "Saúde", icon: "💊", items: ["FARMACIA", "PLANO_DE_SAUDE", "CONSULTA_MEDICA", "ACADEMIA"] },
  { label: "Outros", icon: "📦", items: ["CURSO", "PRESENTES", "ELETRONICOS", "ROUPAS", "PAGAMENTO_FATURA", "FILHOS", "PETS"] },
];

export default function CreateTransactionWeb() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("DEBIT");
  const [selectedSource, setSelectedSource] = useState("");
  const [category, setCategory] = useState("OUTROS");
  const [installments, setInstallments] = useState("1");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const [accRes, cardRes] = await Promise.all([
        api.get(`/account/user/${userId}`),
        api.get(`/CreditCard/user/${userId}`)
      ]);

      setAccounts(accRes.data || []);
      setCards(cardRes.data || []);

      if (accRes.data?.length > 0) {
        setSelectedSource(accRes.data[0].id);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (method) => {
    setPaymentMethod(method);
    setInstallments("1");
    if (method === "DEBIT" && accounts.length > 0) setSelectedSource(accounts[0].id);
    else if (method === "CREDIT" && cards.length > 0) setSelectedSource(cards[0].id);
  };

  const handleSave = async () => {
    if (!amount || !description || !selectedSource) {
      alert("Preencha valor, descrição e origem.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        description,
        amount: parseFloat(amount.replace(",", ".")),
        category,
        date: new Date().toISOString().split("T")[0],
      };

      if (paymentMethod === "CREDIT") {
        payload.type = "CREDIT_CARD_PURCHASE";
        payload.creditCardId = selectedSource;
        payload.installments = parseInt(installments);
      } else {
        payload.type = "EXPENSE";
        payload.sourceAccount = selectedSource;
      }

      await api.post("/transaction", payload);
      alert("Gasto registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao salvar transação.");
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar o texto limpo das subcategorias
  const formatCategoryName = (text) => {
    return text.replace(/_/g, " ").toLowerCase();
  };

  return (
    <div className="container">
      <h1 className="title">Novo Gasto</h1>

      {/* INPUT DE VALOR GIGANTE */}
      <div className="amount-container">
        <span className="currency">R$</span>
        <input
          className="amount-input"
          type="text"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
      </div>

      <div className="card-form">
        <label className="label">O que você comprou?</label>
        <input
          className="input-field"
          type="text"
          placeholder="Ex: Mercado mensal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="label">Forma de Pagamento</label>
        <div className="tab-container">
          <button
            className={`tab-btn ${paymentMethod === "DEBIT" ? "active" : ""}`}
            onClick={() => handleTabChange("DEBIT")}
          >
            Débito / Conta
          </button>
          <button
            className={`tab-btn ${paymentMethod === "CREDIT" ? "active" : ""}`}
            onClick={() => handleTabChange("CREDIT")}
          >
            Crédito
          </button>
        </div>

        <label className="label">
          {paymentMethod === "DEBIT" ? "Pagar com a conta:" : "Pagar com o cartão:"}
        </label>
        <select
          className="select-field"
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
        >
          {paymentMethod === "DEBIT"
            ? accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)
            : cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
          }
        </select>

        {paymentMethod === "CREDIT" && (
          <>
            <label className="label">Parcelamento</label>
            <select
              className="select-field"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}x sem juros</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* SEÇÃO DE CATEGORIAS REMODELADA */}
      <label className="label-section">Selecione a Categoria</label>
      <div className="category-container-block">
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.label} className="category-group">
            <span className="group-title">
              <span className="group-icon-badge">{group.icon}</span>
              {group.label}
            </span>
            <div className="items-grid">
              {group.items.map((item) => {
                const isActive = category === item;
                return (
                  <button
                    key={item}
                    className={`category-card-item ${isActive ? "active" : ""}`}
                    onClick={() => setCategory(item)}
                  >
                    <span className="item-emoji">
                      {CATEGORY_ICONS[item] || "📦"}
                    </span>
                    <span className="item-text">
                      {formatCategoryName(item)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Processando..." : "Confirmar Transação"}
      </button>
    </div>
  );
}