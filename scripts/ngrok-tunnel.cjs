const ngrok = require('ngrok');

console.log('\n📌 NGROK: Nếu báo lỗi auth, lấy token tại https://dashboard.ngrok.com/get-started/your-authtoken và set NGROK_AUTHTOKEN trong .env hoặc terminal.\n');

ngrok
  .connect({ addr: 5173 })
  .then((url) => {
    console.log('✅ Tunnel đang chạy:', url);
  })
  .catch((err) => {
    console.error('Ngrok lỗi:', err.message || err);
    process.exit(1);
  });
