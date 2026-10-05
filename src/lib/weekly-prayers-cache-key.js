// Calendar week in Israel, independent of the server timezone and DST.
export function getPrayerWeekKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  const date = new Date(Date.UTC(Number(value('year')), Number(value('month')) - 1, Number(value('day'))));
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.toISOString().slice(0, 10);
}
