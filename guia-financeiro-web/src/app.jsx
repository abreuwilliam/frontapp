import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/home";             // ✅ Corrigido: era 'Home', o arquivo é 'home.jsx'
import Accounts from "./pages/accounts";     // ✅ Já estava correto
import Invoices from "./pages/invoices";     // ✅ Já estava correto
import CreditCards from "./pages/CreditCards"; 
import FinancialGoalsWeb from "./pages/FinancialGoalsWeb";
import CreateTransactionWeb from "./pages/CreateTransactionWeb";
import Reports from "./pages/ReportsWeb";
import AiTips from "./pages/AiTips"; 
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial redireciona para Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login: Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas (Exigem Token/Login) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/CreateTransactionWeb"
          element={
            <ProtectedRoute>
              <CreateTransactionWeb />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financial-goals"
          element={
            <ProtectedRoute>
              <FinancialGoalsWeb />
            </ProtectedRoute>
          }
        />

        {/* Rota de Cartões */}
        <Route
          path="/credit-cards"
          element={
            <ProtectedRoute>
              <CreditCards />
            </ProtectedRoute>
          }
        />

        {/* Rota de Faturas */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />

        {/* Rota de relatório financeiro */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* 🔥 Nova Rota do Consultor IA */}
        <Route
          path="/ai-tips"
          element={
            <ProtectedRoute>
              <AiTips />
            </ProtectedRoute>
          }
        />

        {/* Fallback: Se a rota não existir, volta para Home */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}