import React, { useState } from "react";
import AccountForm from "../components/AccountForm";
import { useNavigate } from "react-router-dom";
import gethService from "../services/gethService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loginAddress, setLoginAddress] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("register"); // 'register' hoặc 'login'

  const handleRegisterSuccess = () => {
    navigate("/dashboard");
  };

  // 🧩 Xử lý đăng nhập
  const handleLogin = async () => {
    if (!loginAddress || !loginPassword) {
      setMessage("❌ Vui lòng nhập đầy đủ địa chỉ và mật khẩu");
      return;
    }

    try {
      // Thử unlock account
      const success = await gethService.unlockAccount(loginAddress, loginPassword);
      if (success) {
        localStorage.setItem("currentAccount", loginAddress);
        setMessage("✅ Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        setMessage("❌ Sai mật khẩu hoặc tài khoản không tồn tại");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setMessage("❌ Lỗi khi đăng nhập, vui lòng thử lại");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>
        {mode === "register" ? "📝 Đăng ký tài khoản ví" : "🔐 Đăng nhập ví"}
      </h2>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setMode("register")}
          style={{
            marginRight: "10px",
            padding: "8px 14px",
            background: mode === "register" ? "#1976D2" : "#90CAF9",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🆕 Đăng ký
        </button>
        <button
          onClick={() => setMode("login")}
          style={{
            padding: "8px 14px",
            background: mode === "login" ? "#43A047" : "#A5D6A7",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🔐 Đăng nhập
        </button>
      </div>

      {mode === "register" ? (
        <>
          <p style={{ textAlign: "center" }}>
            Tạo tài khoản mới để bắt đầu sử dụng ví blockchain
          </p>
          <AccountForm
            onRegisterSuccess={handleRegisterSuccess}
            showAccountList={false} // ẩn danh sách tài khoản
          />
        </>
      ) : (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Đăng nhập tài khoản có sẵn</h3>
          <input
            type="text"
            placeholder="Nhập địa chỉ ví"
            value={loginAddress}
            onChange={(e) => setLoginAddress(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "10px",
              background: "#43A047",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔓 Đăng nhập
          </button>

          {message && (
            <p
              style={{
                marginTop: "15px",
                color: message.includes("✅") ? "green" : "red",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
