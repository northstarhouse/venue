export const CALENDAR_ICAL_URL = 'https://calendar.google.com/calendar/ical/thenorthstarhouse%40gmail.com/private-06287b2ca0d9ee6acd4f49f9d4d0d2da/basic.ics';

export function parseIcalDate(val) {
  if (!val) return null;
  val = val.replace(/[^0-9TZ]/g, '');
  if (val.length === 8) return new Date(val.slice(0, 4) + '-' + val.slice(4, 6) + '-' + val.slice(6, 8) + 'T00:00:00');
  const y = val.slice(0, 4), mo = val.slice(4, 6), d = val.slice(6, 8), h = val.slice(9, 11), mi = val.slice(11, 13), s = val.slice(13, 15) || '00';
  return new Date(y + '-' + mo + '-' + d + 'T' + h + ':' + mi + ':' + s + (val.endsWith('Z') ? 'Z' : ''));
}

export async function fetchCalendarEvents() {
  const proxy = 'https://corsproxy.io/?' + encodeURIComponent(CALENDAR_ICAL_URL);
  const res = await fetch(proxy);
  const text = res.text ? await res.text() : res;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
  const events = [];
  let current = null;
  normalized.split('\n').forEach((line) => {
    if (line === 'BEGIN:VEVENT') { current = {}; }
    else if (line === 'END:VEVENT') { if (current) events.push(current); current = null; }
    else if (current) {
      const ci = line.indexOf(':');
      if (ci !== -1) { const k = line.slice(0, ci).split(';')[0]; current[k] = line.slice(ci + 1); }
    }
  });
  return events;
}
