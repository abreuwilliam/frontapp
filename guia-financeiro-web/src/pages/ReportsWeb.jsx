import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from "recharts";
import { api } from "../services/api";
import "./ReportsWeb.css";

export default function ReportsWeb() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState("overview");

  const [data, setData] = useState({
    renda: 0,
    gastos: 0,
    saldoConta: 0,
    diasSemGasto: 0,
    gastoConta: 0,
    gastoCartao: 0,
    percentualComprometido: 0,
    variacaoMensal: 0,
    mediaDiaria: 0,
    percentualCartao: 0,
    healthScore: 0,
    alertas: [],
    categorias: {},
    history: null
  });

  const toNumber = (value) => Number(value) || 0;

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        navigate("/login");
        setLoading(false);
        return;
      }

      const fetchSafe = async (url, defaultValue = 0) => {
        try {
          const response = await api.get(url);
          return response.data;
        } catch {
          return defaultValue;
        }
      };

      const [
        renda, gastos, dias, conta, cartao, variacao, media, percCartao,
        health, alertas, categorias, history, saldoReal
      ] = await Promise.all([
        fetchSafe(`/transaction/rendaMensal/${userId}`),
        fetchSafe(`/transaction/gastoTotal/${userId}`),
        fetchSafe(`/transaction/diasSemGasto/${userId}`),
        fetchSafe(`/transaction/gastoConta/${userId}`),
        fetchSafe(`/transaction/gastoCartao/${userId}`),
        fetchSafe(`/api/transactions/variacaoMensal/${userId}`),
        fetchSafe(`/api/transactions/mediaGastoDiario/${userId}`),
        fetchSafe(`/api/transactions/percentualCartao/${userId}`),
        fetchSafe(`/transaction/health-score/${userId}`),
        fetchSafe(`/transaction/alerts/limits/${userId}`, []),
        fetchSafe(`/transaction/gastoPorCategoria/${userId}`, {}),
        fetchSafe(`/transaction/history/${userId}`, null),
        fetchSafe(`/account/balance/${userId}`)
      ]);

      const valorRenda = toNumber(renda);
      const valorGastoConta = toNumber(conta);
      const scoreCorrigido = valorRenda > 0 ? (valorGastoConta / valorRenda) * 100 : 0;

      setData({
        renda: valorRenda,
        gastos: toNumber(gastos),
        saldoConta: toNumber(saldoReal),
        diasSemGasto: toNumber(dias),
        gastoConta: valorGastoConta,
        gastoCartao: toNumber(cartao),
        percentualComprometido: valorRenda > 0 ? (toNumber(gastos) / valorRenda) * 100 : 0,
        variacaoMensal: toNumber(variacao),
        mediaDiaria: toNumber(media),
        percentualCartao: toNumber(percCartao),
        healthScore: scoreCorrigido,
        alertas: Array.isArray(alertas) ? alertas : [],
        categorias: categorias || {},
        history: history || null
      });
    } catch (error) {
      console.error("Falha ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const toggleSection = (section) => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  const totalGeral = useMemo(() => {
    return Object.values(data.categorias || {}).reduce((acc, value) => acc + toNumber(value), 0);
  }, [data.categorias]);

  const categoriaList = useMemo(() => {
    const cores = ["#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f1c40f", "#1abc9c"];
    return Object.entries(data.categorias || {}).map(([key, value], index) => {
      const valor = toNumber(value);
      const percent = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
      return {
        key,
        label: key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
        valor,
        percent,
        color: cores[index % cores.length]
      };
    });
  }, [data.categorias, totalGeral]);

  const healthColor = data.healthScore <= 35 ? "#2ecc71" : data.healthScore <= 70 ? "#f1c40f" : "#e74c3c";

  if (loading) return <div className="reports-loader">Sincronizando dados...</div>;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Relatório Financeiro</h1>
        <button className="btn-secondary" onClick={() => navigate("/home")}>Voltar</button>
      </div>

      {/* 1. FLUXO DE CAIXA */}
      <div className="reports-card">
        <div className="card-header" onClick={() => toggleSection("overview")}>
          <span>📊 Fluxo de Caixa</span>
          <small>{expanded === "overview" ? "recolher ▲" : "ver mais ▼"}</small>
        </div>
        {expanded === "overview" && (
          <div className="card-content">
            <div className="summary-row">
              <div className="mini-card">
                <span className="mini-label">Recebido</span>
                <strong className="value-blue">R$ {data.renda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="mini-card">
                <span className="mini-label">Gasto Total</span>
                <strong className="value-red">R$ {data.gastos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
            <div className="balance-container">
              <div className="balance-row">
                <span className="balance-label">Saldo Disponível</span>
                <strong className="balance-value">R$ {data.saldoConta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="info-badge">
                ℹ️ O valor do cartão (R$ {data.gastoCartao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) não impacta seu saldo de conta atual.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. GASTOS POR CATEGORIA */}
      <div className="reports-card">
        <div className="card-header" onClick={() => toggleSection("categoria")}>
          <span>✨ Gastos por Categoria</span>
          <small>{expanded === "categoria" ? "recolher ▲" : "ver mais ▼"}</small>
        </div>
        {expanded === "categoria" && (
          <div className="card-content">
            {categoriaList.length > 0 ? (
              <>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoriaList} dataKey="valor" cx="50%" cy="50%" outerRadius={80}>
                        {categoriaList.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="category-grid">
                  {categoriaList.map((item) => (
                    <div key={item.key} className="category-item">
                      <div className="category-header">
                        <span className="dot" style={{ backgroundColor: item.color }} />
                        <span className="category-name">{item.label}</span>
                      </div>
                      <strong className="category-value">R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      <span className="category-percent">{item.percent.toFixed(0)}% do total</span>
                      <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty">Sem gastos no período.</p>
            )}
          </div>
        )}
      </div>

      {/* 3. EVOLUÇÃO MENSAL - ALTERADO */}
      <div className="reports-card">
        <div className="card-header" onClick={() => toggleSection("evolucao")}>
          <span>📈 Evolução Mensal</span>
          <small>{expanded === "evolucao" ? "recolher ▲" : "ver mais ▼"}</small>
        </div>

        {expanded === "evolucao" && (
          <div className="card-content">
            {Array.isArray(data.history?.monthlyData) && data.history.monthlyData.length > 0 ? (
              <>
                {/* NOVO: Gráfico de Barras para Evolução */}
                <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '10px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.history.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="monthName" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip 
                        formatter={(value) => `R$ ${toNumber(value).toFixed(2)}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar name="Ganhos" dataKey="totalGanhos" fill="#3498db" radius={[4, 4, 0, 0]} />
                      <Bar name="Gastos" dataKey="totalGastos" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="history-list" style={{ marginTop: '20px' }}>
                  {data.history.monthlyData.map((item, idx) => (
                    <div key={idx} className="history-row">
                      <span>{item.monthName}</span>
                      <span className="value-blue">R$ {toNumber(item.totalGanhos).toFixed(2)}</span>
                      <span className="value-red">R$ {toNumber(item.totalGastos).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {data.history.trend && (
                  <p className="info-text">
                    Status: <strong style={{ color: "#1E90FF" }}>{data.history.trend}</strong>
                  </p>
                )}
              </>
            ) : (
              <p className="empty">Dados insuficientes.</p>
            )}
          </div>
        )}
      </div>

      {/* 4. ANÁLISE E DICAS */}
      <div className="reports-card">
        <div className="card-header" onClick={() => toggleSection("insights")}>
          <span>💡 Análise e Dicas</span>
          <small>{expanded === "insights" ? "recolher ▲" : "ver mais ▼"}</small>
        </div>
        {expanded === "insights" && (
          <div className="card-content">
            <div className="insight-row">
              <span className="insight-icon">🗓️</span>
              <span>Média diária: <strong>R$ {data.mediaDiaria.toFixed(2)}</strong></span>
            </div>
            <div className="insight-row">
              <span className="insight-icon">💳</span>
              <span>Uso do cartão: <strong>{data.percentualCartao.toFixed(0)}%</strong> do total.</span>
            </div>
            <div className="insight-row">
              <span className="insight-icon">🏖️</span>
              <span>Você ficou <strong>{data.diasSemGasto} dias</strong> sem gastar!</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. SCORE DE SAÚDE */}
      <div className="reports-card">
        <div className="card-header" onClick={() => toggleSection("saude")}>
          <span>🧠 Score de Saúde</span>
          <small>{expanded === "saude" ? "recolher ▲" : "ver mais ▼"}</small>
        </div>
        {expanded === "saude" && (
          <div className="card-content">
            <div className="health-info">
              <span>Renda Mensal: <strong>R$ {data.renda.toFixed(2)}</strong></span>
              <small>Gasto Efetivo (Conta): R$ {data.gastoConta.toFixed(2)}</small>
            </div>
            <div className="health-circle" style={{ borderColor: healthColor }}>
              <strong style={{ color: healthColor }}>{data.healthScore.toFixed(0)}%</strong>
              <small>Comprometido</small>
            </div>
            <p className="health-hint">Este índice ignora o cartão de crédito para refletir o comprometimento real da sua renda hoje.</p>
            <div className="alert-container">
              {data.healthScore > 80 ? (
                <div className="alert-badge alert-critical">🚨 Alerta Crítico: Você gastou quase toda sua renda!</div>
              ) : data.healthScore > 50 ? (
                <div className="alert-badge alert-warning">⚠️ Atenção: Mais da metade da sua renda já foi consumida.</div>
              ) : null}
              {data.alertas.map((a, i) => (
                <div key={i} className="alert-badge alert-warning">⚠️ Limite excedido: {a}</div>
              ))}
              {data.healthScore <= 50 && data.alertas.length === 0 && (
                <p className="success-text">✅ Seu orçamento está equilibrado!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}