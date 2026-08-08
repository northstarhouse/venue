import { useState, useEffect, useMemo } from 'react';
import { fetchCalendarEvents, parseIcalDate } from '../lib/ical.js';

const gold = '#886c44';
const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function isAllDayValue(raw) {
  // All-day iCal values are bare dates (YYYYMMDD) with no "T" time separator.
  return !!raw && !raw.includes('T');
}

function expandRange(start, end, endIsAllDay) {
  // All-day events' DTEND is exclusive per the iCal spec (the day after the
  // event actually ends), so back it up one day. Timed events' DTEND is the
  // literal end moment — same calendar day in local time for same-evening
  // events — so it must NOT be shifted back, or short events collapse to
  // zero days entirely.
  const keys = [];
  const hasRealEnd = end && end.getTime() > start.getTime();
  const last = hasRealEnd ? (endIsAllDay ? new Date(end.getTime() - DAY_MS) : end) : start;
  let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  let guard = 0;
  while (cur.getTime() <= lastDay.getTime() && guard < 400) {
    keys.push(dateKey(cur));
    cur = new Date(cur.getTime() + DAY_MS);
    guard++;
  }
  return keys;
}

export default function PublicAvailability() {
  const [bookedDates, setBookedDates] = useState(null);
  const [error, setError] = useState(null);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    fetchCalendarEvents()
      .then((events) => {
        const set = new Set();
        events.forEach((e) => {
          const start = parseIcalDate(e['DTSTART'] || '');
          if (!start) return;
          const end = parseIcalDate(e['DTEND'] || '');
          expandRange(start, end, isAllDayValue(e['DTEND'])).forEach((k) => set.add(k));
        });
        setBookedDates(set);
      })
      .catch((err) => setError(err.message));
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function changeMonth(delta) {
    setViewDate(new Date(year, month + delta, 1));
  }

  const canGoBack = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: '#2a2a2e', padding: '28px 16px', textAlign: 'center' }}>
        <img src="assets/logo.png" alt="North Star House" style={{ width: 200, maxWidth: '100%', margin: '0 auto', display: 'block' }} />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 16px 60px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif", textAlign: 'center', marginBottom: 6 }}>Venue Availability</div>
        <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 28 }}>
          If you've requested a date to be held with a venue coordinator, it may appear unavailable here.
        </div>

        {error && <div style={{ color: '#c62828', fontSize: 12, background: '#ffebee', borderRadius: 8, padding: 16, marginBottom: 20 }}>Could not load the calendar: {error}</div>}

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <button onClick={() => changeMonth(-1)} disabled={!canGoBack} style={{ background: 'none', border: 'none', cursor: canGoBack ? 'pointer' : 'default', opacity: canGoBack ? 1 : 0.25, fontSize: 18, color: gold, padding: 4 }}>‹</button>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif" }}>
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: gold, padding: 4 }}>›</button>
          </div>

          {bookedDates === null && !error && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', padding: '30px 0' }}>Loading calendar…</div>
          )}

          {bookedDates !== null && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#999', textAlign: 'center', padding: '4px 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const isPast = d < today;
                  const booked = bookedDates.has(dateKey(d));
                  const isToday = dateKey(d) === dateKey(today);
                  let bg = '#fff', color = '#2a2a2a', border = '1px solid var(--border)';
                  if (isPast) { bg = '#f7f5f1'; color = '#ccc'; }
                  else if (booked) { bg = '#fbe9e7'; color = '#c0392b'; border = '1px solid #f0c9c2'; }
                  else { bg = '#e8f5e9'; color = '#2e7d32'; border = '1px solid #c8e6c9'; }
                  return (
                    <div key={i} style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: bg, color, border, borderRadius: 6, fontSize: 12, fontWeight: isToday ? 700 : 500,
                      outline: isToday ? `1.5px solid ${gold}` : 'none', outlineOffset: -1,
                    }}>
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20, fontSize: 11, color: '#666' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#e8f5e9', border: '1px solid #c8e6c9' }} /> Available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#fbe9e7', border: '1px solid #f0c9c2' }} /> Booked
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
