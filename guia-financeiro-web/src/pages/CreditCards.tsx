import { useEffect, useState } from "react";
import { api } from "../services/api"; // Ajuste conforme sua pasta de api
import "./CreditCards.css";

type CreditCard = {
  id: string;
  name: string;
  limitAmount: number;
  availableLimit: number;
  brand?: string;
  userId: string;
};

export default function CreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados para Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [brand, setBrand] = useState("VISA");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedId = localStorage.getItem("user_id"); // Web usa localStorage
      if (!savedId) return;

      const [cardsRes, spentRes] = await Promise.all([
        api.get(`/CreditCard/user/${savedId}`),
        api.get(`/transaction/gastoCartao/${savedId}`)
      ]);
      
      setCards(cardsRes.data || []);
      setTotalSpent(Number(spentRes.data) || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (card: CreditCard) => {
    setSelectedCardId(card.id);
    setName(card.name);
    setLimit(String(card.limitAmount));
    setBrand(card.brand || "VISA");
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("user_id");
    if (!name || !limit) return alert("Preencha todos os campos");

    try {
      const payload = {
        name,
        limitAmount: Number(limit.replace(',', '.')),
        brand,
        userId
      };

      if (isEditing && selectedCardId) {
        await api.patch(`/CreditCard/${selectedCardId}`, payload);
      } else {
        await api.post("/CreditCard", payload);
      }
      setModalVisible(false);
      setName(""); setLimit("");
      loadData();
    } catch (error) {
      alert("Erro ao salvar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja excluir este cartão?")) {
      try {
        await api.delete(`/CreditCard/${id}`);
        loadData();
      } catch (error) {
        alert("Erro ao excluir. Verifique se há faturas.");
      }
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="cards-container">
      <h1 className="page-title">💳 Meus Cartões</h1>

      <div className="spent-card">
        <p className="spent-label">Fatura Total Estimada</p>
        <h2 className="spent-value">
          R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      <button className="add-button-dashed" onClick={() => { setIsEditing(false); setModalVisible(true); }}>
        + ADICIONAR NOVO CARTÃO
      </button>

      <p className="section-title">Cartões Ativos</p>

      <div className="cards-list">
        {cards.map((card) => (
          <div key={card.id} className="card-item">
            <div className="card-info">
              <span className="card-brand">{card.brand || "CARTÃO"}</span>
              <span className="card-name">{card.name}</span>
              <div className="limit-row">
                <span>Limite: R$ {card.limitAmount.toFixed(2)}</span>
                <span className="free-limit">Livre: R$ {card.availableLimit.toFixed(2)}</span>
              </div>
            </div>
            <div className="card-actions">
              <button onClick={() => handleOpenEdit(card)} className="btn-edit">Editar</button>
              <button onClick={() => handleDelete(card.id)} className="btn-delete">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL WEB */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">{isEditing ? "Editar Cartão" : "Novo Cartão"}</h3>
            
            <label className="input-label">NOME DO CARTÃO</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank" />
            
            <label className="input-label">LIMITE TOTAL</label>
            <input type="text" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="R$ 0,00" />

            <label className="input-label">BANDEIRA</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">MASTERCARD</option>
              <option value="ELO">ELO</option>
              <option value="AMEX">AMEX</option>
            </select>

            <button className="btn-primary" onClick={handleSave}>
              {isEditing ? "SALVAR ALTERAÇÕES" : "CADASTRAR CARTÃO"}
            </button>
            <button className="btn-cancel" onClick={() => setModalVisible(false)}>CANCELAR</button>
          </div>
        </div>
      )}
    </div>
  );
}