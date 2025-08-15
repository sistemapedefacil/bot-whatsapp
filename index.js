const { create } = require('@wppconnect-team/wppconnect');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { setQrCode } = require('./qrStorage');  // IMPORTANTE
require('dotenv').config();

const sessionName = 'teste';

// Configurações do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Caminho do arquivo onde vamos salvar o QR code
const qrFilePath = path.resolve(__dirname, 'tokens', `${sessionName}-qr.txt`);

// Função para salvar QR code no arquivo
function salvarQrCode(base64Qr) {
  fs.mkdirSync(path.dirname(qrFilePath), { recursive: true });
  fs.writeFileSync(qrFilePath, base64Qr, 'utf-8');
  console.log('✅ QR Code salvo em:', qrFilePath);
}

// Função para registrar cliente no Supabase
async function registrarCliente(session_id, numero_bot) {
  try {
    const { data: existente, error } = await supabase
      .from('clientes_robo')
      .select('id')
      .eq('session_id', session_id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar cliente:', error.message);
      return;
    }

    if (existente) {
      const { error: errUpdate } = await supabase
        .from('clientes_robo')
        .update({ telefone_bot: numero_bot || null })
        .eq('id', existente.id);

      if (errUpdate) {
        console.error('❌ Erro ao atualizar cliente:', errUpdate.message);
      } else {
        console.log('✅ Cliente atualizado com sucesso!');
      }
    } else {
      const { error: errInsert } = await supabase.from('clientes_robo').insert([
        { session_id, telefone_bot: numero_bot || null },
      ]);

      if (errInsert) {
        console.error('❌ Erro ao inserir cliente:', errInsert.message);
      } else {
        console.log('✅ Cliente inserido com sucesso!');
      }
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

// Iniciar sessão do WhatsApp com configuração Puppeteer para Render
create({
  session: sessionName,
  catchQR: (base64Qr, asciiQR) => {
    console.log('📲 Escaneie o QR Code abaixo para conectar:');
    console.log(asciiQR);

    salvarQrCode(base64Qr);  // salva no arquivo
    setQrCode(base64Qr);     // salva em memória para API ler
  },
  statusFind: (statusSession) => {
    console.log(`🟢 Status da sessão: ${statusSession}`);
  },
  mkdirFolderToken: true,
  folderNameToken: './tokens',
  puppeteerOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      '/opt/render/project/.cache/puppeteer/chrome/linux-*/chrome-linux/chrome'
  }
})
  .then((client) => start(client))
  .catch((error) => console.error('❌ Erro ao iniciar o cliente:', error));

function start(client) {
  console.log('🤖 Bot iniciado.');

  client.onMessage(async (message) => {
    console.log(`📩 Mensagem recebida de ${message.from}: ${message.body}`);

    if (!message.isGroupMsg && message.type === 'chat') {
      const { data, error } = await supabase
        .from('respostas_automaticas')
        .select('mensagem')
        .eq('session_id', sessionName)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao buscar mensagem automática:', error.message);
      }

      const resposta = (data && data.length > 0) ? data[0].mensagem : '✅ Mensagem automática enviada!';

      await client.sendText(message.from, resposta);
      console.log('✅ Resposta enviada para:', message.from);
    }
  });

  client.onStateChange(async (state) => {
    console.log(`⚙️ Estado da sessão: ${state}`);

    if (state === 'CONNECTED') {
      try {
        const numeroBot = await client.getWid();
        console.log('Número do bot (getWid):', numeroBot);
        await registrarCliente(sessionName, numeroBot);
      } catch (error) {
        console.error('Erro ao pegar número do bot:', error);
        await registrarCliente(sessionName, null);
      }
    }
  });
}
