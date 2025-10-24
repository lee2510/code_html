const { ethers } = require('ethers');

async function fundAccount() {
  try {
    console.log("🚀 Đang kết nối với Geth...");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Kiểm tra kết nối
    const network = await provider.getNetwork();
    console.log("✅ Đã kết nối - Chain ID:", network.chainId);
    
    // Lấy danh sách accounts từ Geth (account mặc định trong dev mode)
    const accounts = await provider.listAccounts();
    
    if (accounts.length === 0) {
      console.log("❌ Không có account nào trong Geth!");
      console.log("💡 Khởi động Geth với: geth --dev --http ...");
      return;
    }
    
    const defaultAccount = accounts[0].address;
    console.log("📦 Account mặc định Geth:", defaultAccount);
    
    // Kiểm tra số dư account mặc định
    const defaultBalance = await provider.getBalance(defaultAccount);
    console.log("💰 Số dư:", ethers.formatEther(defaultBalance), "ETH");
    
    if (defaultBalance < ethers.parseEther("30")) {
      console.log("❌ Số dư không đủ 30 ETH!");
      return;
    }
    
    // Tạo wallet mới cho test
    console.log("\n🔑 Đang tạo wallet test...");
    const testWallet = ethers.Wallet.createRandom();
    console.log("✅ Wallet test đã tạo!");
    console.log("   Địa chỉ:", testWallet.address);
    console.log("   Private Key:", testWallet.privateKey);
    console.log("   Mnemonic:", testWallet.mnemonic.phrase);
    
    // Mã hóa wallet với password
    console.log("\n🔐 Đang mã hóa wallet với password '123456'...");
    const encryptedJson = await testWallet.encrypt("123456");
    console.log("✅ Đã mã hóa!");
    
    // Lấy signer từ account mặc định
    console.log("\n💸 Đang chuyển 30 ETH từ account Geth...");
    const signer = await provider.getSigner(defaultAccount);
    
    const tx = await signer.sendTransaction({
      to: testWallet.address,
      value: ethers.parseEther("30"),
      gasLimit: 21000
    });
    
    console.log("⏳ Transaction hash:", tx.hash);
    console.log("⏳ Đang chờ xác nhận...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed tại block:", receipt.blockNumber);
    
    // Kiểm tra số dư mới
    const newBalance = await provider.getBalance(testWallet.address);
    console.log("💰 Số dư mới:", ethers.formatEther(newBalance), "ETH");
    
    // In ra thông tin để import vào UI
    console.log("\n" + "=".repeat(80));
    console.log("🎉 TẠO TÀI KHOẢN TEST THÀNH CÔNG!");
    console.log("=".repeat(80));
    console.log("\n📋 THÔNG TIN TÀI KHOẢN:");
    console.log("   Địa chỉ:", testWallet.address);
    console.log("   Mật khẩu: 123456");
    console.log("   Số dư: 30 ETH");
    console.log("   Private Key:", testWallet.privateKey);
    
    console.log("\n📝 COPY ĐOẠN NÀY ĐỂ IMPORT VÀO UI:");
    console.log("   Private Key:", testWallet.privateKey);
    console.log("   Password: 123456");
    
    console.log("\n💾 HOẶC THÊM VÀO LOCALSTORAGE (F12 → Console):");
    console.log("```javascript");
    console.log("const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');");
    console.log("accounts.push(" + JSON.stringify({
      address: testWallet.address,
      encryptedJson: encryptedJson,
      createdAt: new Date().toISOString(),
      isTestAccount: true
    }, null, 2) + ");");
    console.log("localStorage.setItem('accounts', JSON.stringify(accounts));");
    console.log("console.log('✅ Đã thêm tài khoản test!');");
    console.log("location.reload();");
    console.log("```");
    
    console.log("\n✨ Bây giờ bạn có thể:");
    console.log("   1. Import private key vào UI (dùng chức năng Import)");
    console.log("   2. Hoặc paste đoạn code trên vào Console trình duyệt");
    console.log("   3. Dùng địa chỉ này để test giao dịch!");
    
  } catch (error) {
    console.error("\n❌ LỖI:", error.message);
    console.error(error);
  }
}

fundAccount();