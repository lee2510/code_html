import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BalanceChecker from "../components/BalanceChecker";
import TransferForm from "../components/TransferForm";
import TransactionHistory from "../components/TransactionHistory";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);

  // ✅ Khi mở dashboard, kiểm tra xem có tài khoản đã đăng nhập chưa
  useEffect(() => {
    const savedAccount = localStorage.getItem("accountAddress");
    if (!savedAccount) {
      navigate("/register"); // chưa có -> về trang đăng ký / đăng nhập
    } else {
      setAccount(savedAccount); // có -> hiển thị dashboard
    }
  }, [navigate]);

  // 🚪 Xử lý đăng xuất
  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (!confirmLogout) return;

    localStorage.removeItem("accountAddress");
    localStorage.removeItem("accountPassword");

    navigate("/register");
  };

  // 🧭 Loading trong lúc kiểm tra đăng nhập
  if (!account) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>⏳ Đang tải dữ liệu ví...</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Thanh tiêu đề */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
        {/* Header + Đăng xuất */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">💼 Trang quản lý ví</h1>
            <p className="text-sm text-gray-600">
              Địa chỉ ví hiện tại:{" "}
              <span className="font-mono text-blue-600">{account}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
          >
            🚪 Đăng xuất
          </button>
        </div>

        {/* Khu chức năng: kiểm tra số dư, chuyển tiền, lịch sử */}
        <div className="space-y-8">
          {/* Kiểm tra số dư */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">💰 Kiểm tra số dư</h2>
            <BalanceChecker />
          </section>

          {/* Giao dịch giữa 2 ví */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">💸 Chuyển tiền giữa các ví</h2>
            <TransferForm />
          </section>

          {/* Lịch sử giao dịch */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">📜 Lịch sử giao dịch</h2>
            <TransactionHistory />
          </section>
        </div>
      </div>
    </div>
  );
}
