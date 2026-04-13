import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; 
import "./AiTips.css";

export default function AiTips() {
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatAIText = useCallback((text) => {
    if (!text) return "";
    // Garantimos que o texto é string e formatamos números
    const stringText = String(text);
    return stringText.replace(/(\d+\.\d{3,})/g, (match) => {
      const number = parseFloat(match);
      return isNaN(number) ? match : number.toFixed(2);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTips = async () => {
      try {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          if (isMounted) {
            setTips("Sessão não identificada. Por favor, faça login novamente.");
            setLoading(false);
          }
          return;
        }

        const response = await api.get(`/Ia/dicas/${userId}`);
        
        if (isMounted) {
          // Se a API retornar um objeto em vez de string, pegamos o campo de texto ou convertemos
          const dataToFormat = typeof response.data === 'string' 
            ? response.data 
            : (response.data.tips || JSON.stringify(response.data));

          setTips(formatAIText(dataToFormat));
        }
      } catch (error) {
        console.error("Erro ao buscar dados da IA:", error);
        if (isMounted) {
          setTips("Não foi possível carregar as dicas. Tente novamente mais tarde.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTips();

    return () => {
      isMounted = false;
    };
  }, [formatAIText]);

  return (
    <div className="aitips-container">
      <header className="aitips-header">
        <button className="aitips-back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1 className="aitips-title">Consultor Financeiro IA</h1>
      </header>

      <main className="aitips-content">
        {loading ? (
          <div className="aitips-center">
            <div className="aitips-spinner"></div>
            {/* NO WEB: Use <p> ou <span>, nunca <Text> */}
            <p className="aitips-loading-text">Analisando suas finanças com IA...</p>
          </div>
        ) : (
          <div className="aitips-card">
            <span className="aitips-sparkle" role="img" aria-label="ia-icon">✨</span>
            <div className="aitips-markdown-body">
              {/* O ReactMarkdown vai converter o texto em tags HTML padrão (p, h1, li) */}
              <ReactMarkdown>{tips}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}