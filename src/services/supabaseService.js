const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function hasRespondedToday(sessionName, number) {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('auto_respostas')
    .select('id')
    .eq('session_name', sessionName)
    .eq('number', number)
    .eq('date', today)
    .limit(1)
    .single();

  if (error) {
    console.error('Erro ao consultar Supabase:', error.message);
    return false; // assume que não respondeu para evitar bloqueio
  }

  return data !== null;
}

async function markAsResponded(sessionName, number) {
  const today = new Date().toISOString().slice(0, 10);

const { data, error } = await supabase.from('auto_respostas').insert([
  {
    session_name: sessionName,
    number,
    date: today,
  },
]);

if (error) {
  console.error('Erro ao inserir no Supabase:', error);
} else {
  console.log('Inserção no Supabase bem-sucedida:', data);
}


  if (error) {
    console.error('Erro ao inserir no Supabase:', error.message);
  }
}

module.exports = {
  hasRespondedToday,
  markAsResponded,
};
