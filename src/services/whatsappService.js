const wppconnect = require('@wppconnect-team/wppconnect');
const {
  hasRespondedToday,
  markAsResponded,
} = require('./supabaseService');

async function startSession(sessionName) {
  wppconnect
    .create({
      session: sessionName,
      catchQR: (base64Qrimg, asciiQR) => {
        console.log('⚠️ ESCANEIE O QR CODE ABAIXO:');
        console.log(asciiQR);
      },
      statusFind: (statusSession) => {
        console.log('Status da sessão:', statusSession);
      },
      headless: true,
      devtools: false,
      useChrome: true,
      debug: false,
    })
    .then((client) => {
      console.log(`🤖 Sessão ${sessionName} conectada e pronta`);

      client.onMessage(async (message) => {
        const sender = message.from;
        console.log('📩 Nova mensagem recebida:', sender, message.body);

        if (sender.includes('@g.us')) return;

        if (await hasRespondedToday(sessionName, sender)) return;

        const autoMessage = 'Olá! Recebemos sua mensagem. Em breve retornaremos.';
        await client.sendText(sender, autoMessage);
        await markAsResponded(sessionName, sender);

        console.log(`✅ Mensagem automática enviada para ${sender}`);
      });
    })
    .catch((error) => {
      console.error(`Erro na sessão ${sessionName}:`, error);
    });
}

module.exports = { startSession };
