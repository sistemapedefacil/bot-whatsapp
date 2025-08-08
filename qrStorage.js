// qrStorage.js
let latestQrCode = null;

function setQrCode(qr) {
  latestQrCode = qr;
}

function getQrCode() {
  return latestQrCode;
}

module.exports = { setQrCode, getQrCode };
