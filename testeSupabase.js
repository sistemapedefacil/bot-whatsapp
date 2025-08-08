const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testar() {
  const { data, error } = await supabase.from('clientes_robo').select('*').limit(1);
  if (error) {
    console.error('Erro na consulta Supabase:', error.message);
  } else {
    console.log('Conexão Supabase OK! Dados:', data);
  }
}

testar();
