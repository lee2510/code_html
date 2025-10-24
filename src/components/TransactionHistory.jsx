import { useEffect, useState } from "react";
import gethService from "../services/gethService.js";

export default function TransactionHistory() {
  const [txs, setTxs] = useState([]);
  const [deletedTxs, setDeletedTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [viewDeleted, setViewDeleted] = useState(false); // 🔁 Chuyển tab

  useEffect(() => {
    loadTransactions();
    const interval = setInterval(loadTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTransactions = async () => {
    try {
      const transactions = await gethService.getTransactions();
      const stored = JSON.parse(localStorage.getItem("transactions") || "[]");
      const deletedStored = JSON.parse(localStorage.getItem("deletedTransactions") || "[]");

      const merged = [...transactions, ...stored].filter(
        (tx, index, self) =>
          index === self.findIndex((t) => t.hash === tx.hash)
      );

      localStorage.setItem("transactions", JSON.stringify(merged));
      setTxs(merged);
      setDeletedTxs(deletedStored);
    } catch (error) {
      console.error("Lỗi khi tải giao dịch:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Xóa một giao dịch — lưu sang danh sách deleted
  const deleteTransaction = (hash) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    const toDelete = txs.find((tx) => tx.hash === hash);
    const updatedTxs = txs.filter((tx) => tx.hash !== hash);
    const updatedDeleted = [...deletedTxs, { ...toDelete, deletedAt: new Date().toISOString() }];

    setTxs(updatedTxs);
    setDeletedTxs(updatedDeleted);

    localStorage.setItem("transactions", JSON.stringify(updatedTxs));
    localStorage.setItem("deletedTransactions", JSON.stringify(updatedDeleted));
  };

  // 🧹 Xóa toàn bộ
  const clearHistory = () => {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử giao dịch?")) return;

    const allDeleted = txs.map((tx) => ({ ...tx, deletedAt: new Date().toISOString() }));
    const updatedDeleted = [...deletedTxs, ...allDeleted];

    setDeletedTxs(updatedDeleted);
    setTxs([]);

    localStorage.setItem("transactions", "[]");
    localStorage.setItem("deletedTransactions", JSON.stringify(updatedDeleted));
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const shortenAddress = (address = "") =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A";

  const shortenHash = (hash = "") =>
    hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : "N/A";

  const totalGas = (list) =>
    list
      .reduce((sum, tx) => {
        if (tx.gasFee) return sum + parseFloat(tx.gasFee);
        if (tx.gasUsed && tx.gasPrice)
          return sum + (parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)) / 1e9;
        return sum;
      }, 0)
      .toFixed(8);

  if (loading) {
    return (
      <div>
        <h2>Lịch sử giao dịch</h2>
        <p>Đang tải...</p>
      </div>
    );
  }

  const currentList = viewDeleted ? deletedTxs : txs;

  return (
    <div className="transaction-history">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>{viewDeleted ? "🗑️ Lịch sử đã xóa" : "💸 Lịch sử giao dịch"}</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {txs.length > 0 && !viewDeleted && (
            <button
              onClick={clearHistory}
              style={{
                background: "#f44336",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🧹 Xóa toàn bộ
            </button>
          )}
          <button
            onClick={() => setViewDeleted(!viewDeleted)}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {viewDeleted ? "⬅️ Quay lại giao dịch" : "🗑️ Xem lịch sử đã xóa"}
          </button>
        </div>
      </div>

      {/* Danh sách giao dịch */}
      {currentList.length === 0 ? (
        <p
          style={{
            padding: "20px",
            background: "#f5f5f5",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          {viewDeleted ? "Chưa có lịch sử đã xóa" : "Chưa có giao dịch nào"}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "15px",
              background: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "#2196F3", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Thời gian</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Từ</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Đến</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Số tiền (ETH)</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Phí Gas (ETH)</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Hash</th>
                {!viewDeleted && (
                  <th style={{ padding: "12px", textAlign: "center" }}>Trạng thái</th>
                )}
                <th style={{ padding: "12px", textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((tx, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #e0e0e0",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <td style={{ padding: "12px" }}>
                    {formatDate(tx.timestamp || tx.deletedAt)}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace" }}>
                    {shortenAddress(tx.from)}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace" }}>
                    {shortenAddress(tx.to)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {tx.value}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: "#e65100",
                      background: "#fff3e0",
                    }}
                  >
                    {tx.gasFee
                      ? parseFloat(tx.gasFee).toFixed(8)
                      : tx.gasUsed && tx.gasPrice
                      ? (
                          (parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice)) /
                          1e9
                        ).toFixed(8)
                      : "N/A"}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace" }}>
                    {shortenHash(tx.hash)}
                  </td>

                  {!viewDeleted && (
                    <td style={{ textAlign: "center", padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "3px",
                          fontSize: "11px",
                          background:
                            tx.status === "success" ? "#4caf50" : "#f44336",
                          color: "white",
                        }}
                      >
                        {tx.status === "success" ? "✓" : "✗"}
                      </span>
                    </td>
                  )}

                  <td
                    style={{
                      padding: "12px",
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => setSelectedTx(tx)}
                      style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      👁️ Xem
                    </button>
                    {!viewDeleted && (
                      <button
                        onClick={() => deleteTransaction(tx.hash)}
                        style={{
                          background: "#e53935",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        🗑 Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tổng hợp */}
      {currentList.length > 0 && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#fff3e0",
            borderRadius: "5px",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              ℹ️ Tổng số: <strong>{currentList.length}</strong>
            </div>
            <div>
              ⛽ Tổng phí Gas:{" "}
              <strong style={{ color: "#e65100" }}>
                {totalGas(currentList)} ETH
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Popup chi tiết giao dịch */}
      {selectedTx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Chi tiết giao dịch</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(selectedTx).map(([key, value]) => (
                  <tr key={key} style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      {key}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button
                onClick={() => setSelectedTx(null)}
                style={{
                  background: "#1976d2",
                  color: "white",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
