import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import BalanceChecker from "./components/BalanceChecker";
import TransferForm from "./components/TransferForm";
import TransactionHistory from "./components/TransactionHistory";

function Dashboard() {
  const accountAddress = localStorage.getItem("accountAddress");

  if (!accountAddress) {
    // Nếu chưa có account thì tự động chuyển về trang đăng ký
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">💎 Ví Blockchain Dashboard</h1>
      <div className="max-w-2xl mx-auto space-y-4">
        <BalanceChecker />
        <TransferForm />
        <TransactionHistory />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
