import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Hàm tiện ích gọi RPC trực tiếp đến Geth
async function rpcCall(method, params = []) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

const gethService = {
  /**
   * 🔑 Khởi tạo tài khoản test với 30 ETH (từ account mặc định của Geth)
   */
  initTestAccount: async () => {
    try {
      const testWallet = ethers.Wallet.createRandom();
      const password = "123456";
      const encryptedJson = await testWallet.encrypt(password);

      // Lấy danh sách tài khoản từ Geth
      const accounts = await rpcCall("eth_accounts");
      if (!accounts || accounts.length === 0)
        throw new Error("Không tìm thấy tài khoản Geth mặc định!");

      const defaultAccount = accounts[0];
      console.log("📦 Geth default account:", defaultAccount);

      // Chuyển ETH từ defaultAccount sang test wallet
      const txHash = await rpcCall("eth_sendTransaction", [
        {
          from: defaultAccount,
          to: testWallet.address,
          value: ethers.toBeHex(ethers.parseEther("30")),
          gas: "0x5208", // 21000
        },
      ]);
      console.log("⏳ Đã gửi transaction:", txHash);

      // Lưu test account vào localStorage
      const localAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
      localAccounts.push({
        address: testWallet.address,
        encryptedJson,
        createdAt: new Date().toISOString(),
        isTestAccount: true,
      });
      localStorage.setItem("accounts", JSON.stringify(localAccounts));

      console.log("✅ Tạo test account thành công:", testWallet.address);
      return {
        address: testWallet.address,
        password,
        privateKey: testWallet.privateKey,
      };
    } catch (err) {
      console.error("❌ Lỗi tạo test account:", err);
      throw err;
    }
  },

  /**
   * 🪪 Tạo tài khoản mới (local)
   */
  createAccount: async (password) => {
    try {
      const wallet = ethers.Wallet.createRandom();
      const encryptedJson = await wallet.encrypt(password);
      const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

      accounts.push({
        address: wallet.address,
        encryptedJson,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("accounts", JSON.stringify(accounts));

      return wallet.address;
    } catch (error) {
      throw new Error(`Không thể tạo tài khoản: ${error.message}`);
    }
  },

  /**
   * 📋 Lấy danh sách tài khoản đã lưu
   */
  getAccounts: () => {
    try {
      const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
      return accounts.map((acc) => acc.address);
    } catch {
      return [];
    }
  },

  /**
   * 💰 Kiểm tra số dư
   */
  getBalance: async (address) => {
    if (!ethers.isAddress(address)) throw new Error("Địa chỉ không hợp lệ!");
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  },

  /**
   * 💸 Gửi giao dịch (từ local wallet)
   */
  sendTransaction: async (from, to, value, password) => {
    if (!ethers.isAddress(from) || !ethers.isAddress(to))
      throw new Error("Địa chỉ không hợp lệ");
    if (parseFloat(value) <= 0) throw new Error("Số tiền phải lớn hơn 0");

    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    const account = accounts.find(
      (a) => a.address.toLowerCase() === from.toLowerCase()
    );
    if (!account) throw new Error("Không tìm thấy tài khoản!");

    let wallet;
    try {
      wallet = await ethers.Wallet.fromEncryptedJson(account.encryptedJson, password);
    } catch {
      throw new Error("Mật khẩu không đúng!");
    }

    const connectedWallet = wallet.connect(provider);
    const balance = await provider.getBalance(from);
    const valueWei = ethers.parseEther(value.toString());
    if (balance < valueWei)
      throw new Error(`Số dư không đủ (hiện có ${ethers.formatEther(balance)} ETH)`);

    const feeData = await provider.getFeeData();
    const tx = await connectedWallet.sendTransaction({
      to,
      value: valueWei,
      gasLimit: 21000,
      gasPrice: feeData.gasPrice,
    });

    console.log("📤 Transaction:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Đã xác nhận tại block:", receipt.blockNumber);

    // Ghi log vào localStorage
    const txs = JSON.parse(localStorage.getItem("transactions") || "[]");
    txs.unshift({
      hash: tx.hash,
      from,
      to,
      value,
      status: receipt.status === 1 ? "success" : "failed",
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("transactions", JSON.stringify(txs));

    return tx.hash;
  },

  /**
   * 🔍 Lấy lịch sử giao dịch local
   */
  getTransactions: () => {
    try {
      return JSON.parse(localStorage.getItem("transactions") || "[]");
    } catch {
      return [];
    }
  },

  /**
   * 🧹 Xoá tài khoản
   */
  deleteAccount: (address) => {
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    const updated = accounts.filter(
      (a) => a.address.toLowerCase() !== address.toLowerCase()
    );
    localStorage.setItem("accounts", JSON.stringify(updated));
    return true;
  },

  /**
   * 🔐 Xuất private key
   */
  exportPrivateKey: async (address, password) => {
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    const acc = accounts.find(
      (a) => a.address.toLowerCase() === address.toLowerCase()
    );
    if (!acc) throw new Error("Không tìm thấy tài khoản!");

    const wallet = await ethers.Wallet.fromEncryptedJson(acc.encryptedJson, password);
    return wallet.privateKey;
  },

  /**
   * 📥 Import từ private key
   */
  importFromPrivateKey: async (privateKey, password) => {
    const wallet = new ethers.Wallet(privateKey);
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    if (accounts.find((a) => a.address.toLowerCase() === wallet.address.toLowerCase()))
      throw new Error("Tài khoản đã tồn tại!");

    const encryptedJson = await wallet.encrypt(password);
    accounts.push({
      address: wallet.address,
      encryptedJson,
      createdAt: new Date().toISOString(),
      imported: true,
    });
    localStorage.setItem("accounts", JSON.stringify(accounts));

    return wallet.address;
  },

  /**
   * 🔗 Kiểm tra kết nối Geth
   */
  checkConnection: async () => {
    try {
      const network = await provider.getNetwork();
      console.log("🔗 Kết nối Geth thành công:", network.chainId);
      return true;
    } catch (err) {
      console.error("Không kết nối được Geth:", err);
      return false;
    }
  },
};

export default gethService;
