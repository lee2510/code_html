import { useState } from "react";
import gethService from "../services/gethService.js";

export default function BalanceChecker() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkBalance = async () => {
    if (!address) {
      setError("Vui lòng nhập địa chỉ ví");
      return;
    }

    setLoading(true);
    setError("");
    setBalance(null);

    try {
      const bal = await gethService.getBalance(address);
      setBalance(bal);
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="balance-checker">
      <h2>Kiểm tra số dư</h2>
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Nhập địa chỉ ví (0x...)"
          style={{ width: "400px" }}
        />
        <button onClick={checkBalance} disabled={loading}>
          {loading ? "Đang kiểm tra..." : "Kiểm tra"}
        </button>
      </div>

      {balance !== null && (
        <div style={{ 
          marginTop: "15px", 
          padding: "15px", 
          background: "#e8f5e9", 
          borderRadius: "5px",
          fontSize: "18px"
        }}>
          💰 Số dư: <strong>{balance} ETH</strong>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: "15px", 
          padding: "15px", 
          background: "#ffebee", 
          borderRadius: "5px",
          color: "#c62828"
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}