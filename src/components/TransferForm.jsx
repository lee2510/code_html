import { useState, useEffect } from "react";
import gethService from "../services/gethService.js";

export default function TransferForm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [txDetails, setTxDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [showGas, setShowGas] = useState(false); // ✅ Ẩn/hiện phần gas

  // 🔹 Tự động ước tính gas khi user nhập thông tin
  useEffect(() => {
    const estimateGasFee = async () => {
      if (!from || !to || !value || parseFloat(value) <= 0) {
        setEstimatedGas(null);
        return;
      }

      setEstimating(true);
      try {
        const estimate = await gethService.estimateGasFee(from, to, parseFloat(value));

        // Nếu estimate là object => lưu toàn bộ
        if (typeof estimate === "object" && estimate !== null) {
          setEstimatedGas(estimate);
        } else {
          setEstimatedGas({ gasFeeEth: estimate });
        }
      } catch (error) {
        console.error("Lỗi ước tính gas:", error);
        setEstimatedGas(null);
      } finally {
        setEstimating(false);
      }
    };

    const timer = setTimeout(estimateGasFee, 600);
    return () => clearTimeout(timer);
  }, [from, to, value]);

  // 🔹 Gửi giao dịch
  const sendTransaction = async () => {
    if (!from || !to || !value || !password) {
      setMessage("❌ Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (isNaN(value) || parseFloat(value) <= 0) {
      setMessage("❌ Số ETH không hợp lệ");
      return;
    }

    setLoading(true);
    setMessage("🔄 Đang xử lý giao dịch...");
    setTxHash("");
    setTxDetails(null);
    setShowDetails(false);

    try {
      const hash = await gethService.sendTransaction(from, to, parseFloat(value), password);
      setTxHash(hash);
      setMessage("✅ Giao dịch thành công!");

      const details = await gethService.getTransactionDetails(hash);
      setTxDetails(details);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="transfer-form" style={{ padding: "20px" }}>
      <h2 style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>💸 Chuyển tiền</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Từ địa chỉ (From)"
          disabled={loading}
        />

        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Đến địa chỉ (To)"
          disabled={loading}
        />

        <input
          type="number"
          step="0.001"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Số ETH"
          disabled={loading}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu ví"
          disabled={loading}
        />

        {/* ✅ Nút bật/tắt hiển thị Gas Estimate */}
        <button
          type="button"
          onClick={() => setShowGas(!showGas)}
          style={{
            padding: "6px 10px",
            fontSize: "14px",
            background: showGas ? "#ef5350" : "#ffb300",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          {showGas ? "Ẩn ước tính Gas ⛽" : "Hiện ước tính Gas ⛽"}
        </button>

        {/* ✅ Hiển thị chi tiết gas nếu bật */}
        {showGas && estimatedGas && !estimating && (
          <div
            style={{
              fontSize: "13px",
              background: "#fff8e1",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ffe082",
              marginTop: "5px",
            }}
          >
            <strong>⛽ Ước tính phí Gas:</strong>
            <ul style={{ margin: "5px 0 0 15px", padding: 0 }}>
              {Object.entries(estimatedGas).map(([key, val]) => (
                <li key={key}>
                  {key}: <strong>{String(val)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={sendTransaction}
          disabled={loading}
          style={{
            padding: "10px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {loading ? "⏳ Đang gửi..." : "🚀 Gửi giao dịch"}
        </button>
      </div>

      {/* Thông báo trạng thái */}
      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "5px",
            background: message.includes("✅")
              ? "#e8f5e9"
              : message.includes("🔄")
              ? "#fffde7"
              : "#ffebee",
            color: message.includes("❌") ? "#c62828" : "#000",
          }}
        >
          {message}
        </div>
      )}

      {/* Thông tin giao dịch */}
      {txHash && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#e3f2fd",
            borderRadius: "5px",
            wordBreak: "break-all",
          }}
        >
          <strong>Transaction Hash:</strong>
          <br />
          <code style={{ fontSize: "12px" }}>{txHash}</code>

          {txDetails && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: "#2196F3",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {showDetails ? "Ẩn chi tiết" : "👁️ Xem chi tiết"}
              </button>
            </div>
          )}

          {showDetails && txDetails && (
            <div
              style={{
                marginTop: "15px",
                borderTop: "1px solid #90caf9",
                paddingTop: "10px",
              }}
            >
              <strong>📊 Chi tiết giao dịch:</strong>
              <table
                style={{
                  width: "100%",
                  marginTop: "10px",
                  fontSize: "14px",
                  borderCollapse: "collapse",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ color: "#666" }}>Từ:</td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{txDetails.from}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#666" }}>Đến:</td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{txDetails.to}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#666" }}>Số tiền:</td>
                    <td style={{ fontWeight: "bold" }}>{txDetails.value} ETH</td>
                  </tr>
                  <tr style={{ background: "#fff3e0" }}>
                    <td style={{ color: "#666" }}>⛽ Gas Used:</td>
                    <td>{txDetails.gasUsed}</td>
                  </tr>
                  <tr style={{ background: "#fff3e0" }}>
                    <td style={{ color: "#666" }}>⛽ Gas Price:</td>
                    <td>{txDetails.gasPrice} Gwei</td>
                  </tr>
                  <tr style={{ background: "#ffecb3" }}>
                    <td style={{ color: "#e65100", fontWeight: "bold" }}>💸 Phí Gas:</td>
                    <td style={{ color: "#e65100", fontWeight: "bold" }}>
                      {txDetails.gasUsed && txDetails.gasPrice
                        ? (
                            (parseFloat(txDetails.gasUsed) * parseFloat(txDetails.gasPrice)) /
                            1e9
                          ).toFixed(8) + " ETH"
                        : "Đang tính..."}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#666" }}>Block:</td>
                    <td>{txDetails.blockNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#666" }}>Status:</td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          background:
                            txDetails.status === "Success" ? "#4caf50" : "#f44336",
                          color: "white",
                          borderRadius: "3px",
                          fontSize: "12px",
                        }}
                      >
                        {txDetails.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
