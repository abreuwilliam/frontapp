import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import "./InvoicesWeb.css";

export default function InvoicesWeb() {
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const [invRes, accRes] = await Promise.all([
        api.get(`/invoice/user/${userId}?t=${new Date().getTime()}`),
        api.get(`/account/user/${userId}?t=${new Date().getTime()}`),
      ]);

      setInvoices(invRes.data);
      setAccounts(accRes.data);

      if (accRes.data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accRes.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedInvoice?.id || !selectedAccountId) {
      alert("Selecione uma conta para o pagamento.");
      return;
    }

    try {
      setLoading(true);

      const [year, month, day] = selectedInvoice.referenceMonth.split("-");
      const dateRef = new Date(year, month - 1, day);
      const monthLabel = dateRef.toLocaleDateString("pt-BR", {
        month: "long",
      }).toUpperCase();

      const payload = {
        description: `PAGAMENTO FATURA - ${monthLabel}`,
        amount: selectedInvoice.totalAmount,
        category: "PAGAMENTO_FATURA",
        type: "EXPENSE",
        date: new Date().toISOString().split("T")[0],
        sourceAccount: selectedAccountId,
        installments: 1,
      };

      console.log("Enviando para o Java:", payload);

      await api.post(
        `/invoice/payment/${selectedInvoice.id}/${selectedAccountId}`,
        payload
      );

      alert("Fatura paga com sucesso!");
      setPaymentModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Erro no pagamento:", error.response?.data || error.message);
      alert("Falha ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) =>
    activeTab === "PAID" ? inv.paid : !inv.paid
  );

  return (
    <div className="container">
      <h1 className="title">Faturas de Cartão</h1>

      <div className="tab-container">
        <button
          className={`tab ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => setActiveTab("PENDING")}
        >
          Em Aberto
        </button>
        <button
          className={`tab ${activeTab === "PAID" ? "active" : ""}`}
          onClick={() => setActiveTab("PAID")}
        >
          Pagas
        </button>
      </div>

      {loading && invoices.length === 0 ? (
        <div className="loading">Carregando...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="empty-text">Nenhuma fatura encontrada.</div>
      ) : (
        filteredInvoices.map((item) => {
          const [year, month, day] = item.referenceMonth.split("-");
          const date = new Date(year, month - 1, day);
          const monthText = date.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={item.id}
              className={`card ${item.paid ? "card-paid" : ""}`}
            >
              <div className="card-header">
                <span className="month-text">{monthText}</span>
                {item.paid && <span className="paid-check">✔️</span>}
              </div>

              <div className="amount-text">R$ {item.totalAmount.toFixed(2)}</div>

              {!item.paid && (
                <button
                  className="pay-button"
                  onClick={() => {
                    setSelectedInvoice(item);
                    setPaymentModalVisible(true);
                  }}
                >
                  PAGAR AGORA
                </button>
              )}
            </div>
          );
        })
      )}

      {paymentModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Pagamento</h2>

            <div className="info-row">
              <span>Valor da Fatura:</span>
              <span>R$ {selectedInvoice?.totalAmount.toFixed(2)}</span>
            </div>

            <label>Selecione a conta para débito:</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (R$ {acc.balance.toFixed(2)})
                </option>
              ))}
            </select>

            <button
              className="confirm-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Carregando..." : "CONFIRMAR PAGAMENTO"}
            </button>

            <button
              className="cancel-btn"
              onClick={() => setPaymentModalVisible(false)}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}