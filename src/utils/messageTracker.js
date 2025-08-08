const respondedToday = new Map();

function hasRespondedToday(sessionName, number) {
  const key = `${sessionName}-${number}`;
  const today = new Date().toISOString().slice(0, 10); // formato: AAAA-MM-DD

  return respondedToday.get(key) === today;
}

function markAsResponded(sessionName, number) {
  const key = `${sessionName}-${number}`;
  const today = new Date().toISOString().slice(0, 10);
  respondedToday.set(key, today);
}

module.exports = {
  hasRespondedToday,
  markAsResponded,
};
