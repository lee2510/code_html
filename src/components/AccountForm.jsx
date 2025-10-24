import { useState, useEffect } from "react";
import gethService from "../services/gethService.js";

export default function AccountForm({ onRegisterSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Kiểm tra nếu có tài khoản đã đăng nhập
  useEffect(() => {
    const savedAccount = localStorage.getItem("accountAddress");
    if (savedAccount) setAccount(savedAccount);
  }, []);

  // Lưu thông tin metadata
  const saveAccountMeta = (address, type) => {
    const meta = JSON.parse(localStorage.getItem("accountMeta") || "{}");
    if (!meta[address]) {
      meta[address] = {
        type,
        createdAt: new Date().toLocaleString(),
      };
      localStorage.setItem("accountMeta", JSON.stringify(meta));
    }
  };

  // 🧩 Tạo tài khoản người dùng
  const createAccount = async () => {
    if (!password) return setMessage("❌ Vui lòng nhập mật khẩu");
    if (password.length < 6) return setMessage("❌ Mật khẩu phải ≥ 6 ký tự");
    if (password !== confirmPassword)
      return setMessage("❌ Mật khẩu xác nhận không khớp");

    setLoading(true);
    setMessage("⏳ Đang tạo tài khoản...");

    try {
      const address = await gethService.createAccount(password);
      saveAccountMeta(address, "User");
      localStorage.setItem("accountAddress", address);
      localStorage.setItem("accountPassword", password);
      setAccount(address);
      setMessage(`✅ Tạo tài khoản thành công: ${address}`);
      setPassword("");
      setConfirmPassword("");
      if (onRegisterSuccess) onRegisterSuccess(address);
    } catch (error) {
      setMessage(`❌ Lỗi khi tạo tài khoản: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🎁 Tạo tài khoản test
  const createTestAccount = async () => {
    setLoading(true);
    setMessage("⏳ Đang tạo tài khoản test...");
    try {
      const testAcc = await gethService.initTestAccount();
      saveAccountMeta(testAcc.address, "Test");
      localStorage.setItem("accountAddress", testAcc.address);
      localStorage.setItem("accountPassword", "123456");
      setAccount(testAcc.address);
      setMessage(`✅ Tạo tài khoản test thành công: ${testAcc.address}`);
      if (onRegisterSuccess) onRegisterSuccess(testAcc.address);
    } catch (error) {
      setMessage(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Đăng nhập
  const login = async () => {
    const savedMeta = JSON.parse(localStorage.getItem("accountMeta") || "{}");
    const accList = Object.keys(savedMeta);

    if (accList.length === 0) return setMessage("⚠️ Chưa có tài khoản nào.");
    if (!loginPassword) return setMessage("❌ Vui lòng nhập mật khẩu để đăng nhập.");

    setLoading(true);
    try {
      const unlocked = await gethService.unlockFirstAccount(loginPassword);
      if (unlocked) {
        const firstAddress = accList[0];
        localStorage.setItem("accountAddress", firstAddress);
        localStorage.setItem("accountPassword", loginPassword);
        setAccount(firstAddress);
        setMessage(`✅ Đăng nhập thành công: ${firstAddress}`);
        if (onRegisterSuccess) onRegisterSuccess(firstAddress);
      } else {
        setMessage("❌ Sai mật khẩu hoặc không thể mở khóa tài khoản.");
      }
    } catch (error) {
      setMessage(`❌ Lỗi đăng nhập: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Đăng xuất
  const logout = () => {
    localStorage.removeItem("accountAddress");
    localStorage.removeItem("accountPassword");
    setAccount(null);
    setMessage("🚪 Đã đăng xuất thành công.");
  };

  // 📋 Copy địa chỉ
  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    alert("📋 Đã copy địa chỉ: " + account);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      {!account ? (
        <>
          <h2>🔐 Đăng ký hoặc đăng nhập</h2>

          {/* --- Đăng ký tài khoản mới --- */}
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <h4>Đăng ký tài khoản mới</h4>
            <input
              type="password"
              placeholder="Mật khẩu (≥ 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "6px 0" }}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "6px 0" }}
            />
            <button
              onClick={createAccount}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Đang xử lý..." : "Tạo tài khoản người dùng"}
            </button>

            <p style={{ textAlign: "center", marginTop: "10px" }}>hoặc</p>

            <button
              onClick={createTestAccount}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              🎁 Tạo tài khoản test (30 ETH)
            </button>
          </div>

          {/* --- Đăng nhập --- */}
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#fff8e1",
              borderRadius: "8px",
            }}
          >
            <h4>Đăng nhập</h4>
            <input
              type="password"
              placeholder="Nhập mật khẩu để đăng nhập"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", margin: "6px 0" }}
            />
            <button
              onClick={login}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>👋 Xin chào!</h2>
          <p>
            Địa chỉ ví hiện tại:{" "}
            <span style={{ fontFamily: "monospace" }}>{account}</span>
          </p>

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              onClick={copyAddress}
              style={{
                background: "#2196F3",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              📋 Copy địa chỉ
            </button>
            <button
              onClick={logout}
              style={{
                background: "#E53935",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </>
      )}

      {/* 📨 Thông báo */}
      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: message.includes("✅")
              ? "#E8F5E9"
              : message.includes("❌")
              ? "#FFEBEE"
              : "#FFF3E0",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#333",
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
