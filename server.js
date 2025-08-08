const express = require('express');
const { getQrCode } = require('./qrStorage');

const app = express();
const port = 3000; // ou qualquer porta que você preferir

app.get('/api/qr', (req, res) => {
  const qr = getQrCode();
  if (!qr) {
    return res.status(404).json({ error: 'QR code ainda não gerado' });
  }
  res.json({ qr });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
