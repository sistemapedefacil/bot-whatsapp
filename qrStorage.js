// qrStorage.js
let qrCodeBase64 = null;

function setQrCode(base64Qr) {
  qrCodeBase64 = base64Qr;
}

function getQrCode() {
  return qrCodeBase64;
}

module.exports = { setQrCode, getQrCode };
