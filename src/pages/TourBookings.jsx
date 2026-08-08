import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const gold = '#886c44';

function AddAvailabilityForm({ hosts, onAdded }) {
  const [hostId, setHostId] = useState(hosts[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('45');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hostId || !date || !time) { setErr('Host, date, and time are required.'); return; }
    setBusy(true); setErr('');
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + parseInt(duration, 10) * 60000);
    const { data, error } = await supabase.from('venue_tour_availability').insert({
      host_id: hostId, slot_start: start.toISOString(), slot_end: end.toISOString(),
    }).select('*, venue_tour_hosts(id,name)');
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onAdded(data[0]);
    setDate(''); setTime('');
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#2a2a2a' }}>Add Tour Availability</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <select className="input" value={hostId} onChange={e => setHostId(e.target.value)}>
          {hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} required />
        <select className="input" value={duration} onChange={e => setDuration(e.target.value)}>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
        </select>
      </div>
      {err && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <button type="submit" className="btn-gold" disabled={busy}>{busy ? 'Adding…' : '+ Add Slot'}</button>
    </form>
  );
}

function statusColor(status) {
  if (status === 'Scheduled') return { bg: '#e3f2fd', fg: '#1976d2' };
  if (status === 'Completed') return { bg: '#e8f5e9', fg: '#2e7d32' };
  return { bg: '#f5f0e8', fg: '#888' };
}

export default function TourBookings() {
  const [hosts, setHosts] = useState([]);
  const [openSlots, setOpenSlots] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const nowIso = new Date().toISOString();
      const [hostsRes, slotsRes, toursRes] = await Promise.all([
        supabase.from('venue_tour_hosts').select('*').eq('active', true).order('name'),
        supabase.from('venue_tour_availability').select('*, venue_tour_hosts(id,name)').eq('is_booked', false).gt('slot_start', nowIso).order('slot_start'),
        supabase.from('venue_tours').select('*, venue_inquiries(id,name,email,phone), venue_tour_hosts(id,name)').order('slot_start', { ascending: false }),
      ]);
      if (hostsRes.error) { setError(hostsRes.error.message); setLoading(false); return; }
      setHosts(hostsRes.data || []);
      setOpenSlots(slotsRes.data || []);
      setTours(toursRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function removeSlot(id) {
    if (!window.confirm('Remove this open slot?')) return;
    await supabase.from('venue_tour_availability').delete().eq('id', id);
    setOpenSlots(prev => prev.filter(s => s.id !== id));
  }

  async function cancelTour(id) {
    if (!window.confirm('Cancel this tour?')) return;
    const { data, error } = await supabase.from('venue_tours').update({ status: 'Cancelled' }).eq('id', id).select('*, venue_inquiries(id,name,email,phone), venue_tour_hosts(id,name)');
    if (!error && data?.[0]) {
      setTours(prev => prev.map(t => t.id === id ? data[0] : t));
      if (data[0].availability_id) await supabase.from('venue_tour_availability').update({ is_booked: false }).eq('id', data[0].availability_id);
    }
  }

  const now = new Date();
  const upcoming = tours.filter(t => t.status === 'Scheduled' && new Date(t.slot_start) >= now);
  const past = tours.filter(t => t.status !== 'Scheduled' || new Date(t.slot_start) < now);

  function TourRow({ tour }) {
    const c = statusColor(tour.status);
    const d = new Date(tour.slot_start);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
    const inq = tour.venue_inquiries;
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>{inq?.name || 'Unknown'}</div>
            <span style={{ fontSize: 10, fontWeight: 700, background: c.bg, color: c.fg, padding: '2px 9px', borderRadius: 20 }}>{tour.status}</span>
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{dateStr} · {timeStr} · with {tour.venue_tour_hosts?.name}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: '#666' }}>
            {inq?.email && <a href={`mailto:${inq.email}`} style={{ color: gold, textDecoration: 'none' }}>{inq.email}</a>}
            {inq?.phone && <span>{inq.phone}</span>}
          </div>
        </div>
        {tour.status === 'Scheduled' && (
          <button className="btn-ghost" onClick={() => cancelTour(tour.id)}>Cancel</button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif", marginBottom: 6 }}>Tour Bookings</div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>Manage tour availability and view scheduled tours</div>

      {loading && <div style={{ color: '#aaa', fontSize: 13, padding: 40, textAlign: 'center' }}>Loading…</div>}
      {error && <div style={{ color: '#c62828', fontSize: 12, background: '#ffebee', borderRadius: 8, padding: 16 }}>{error}</div>}

      {!loading && !error && (
        <>
          <AddAvailabilityForm hosts={hosts} onAdded={slot => setOpenSlots(prev => [...prev, slot].sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start)))} />

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#888', marginBottom: 10 }}>Open Slots ({openSlots.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 26 }}>
            {openSlots.map(slot => {
              const d = new Date(slot.slot_start);
              return (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
                  <div style={{ fontSize: 13, color: '#444' }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })} · {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' })} · {slot.venue_tour_hosts?.name}
                  </div>
                  <button onClick={() => removeSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, lineHeight: 1 }}>×</button>
                </div>
              );
            })}
            {openSlots.length === 0 && <div style={{ fontSize: 12, color: '#bbb', padding: '8px 4px' }}>No open slots — add some above.</div>}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#888', marginBottom: 10 }}>Upcoming Tours ({upcoming.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
            {upcoming.map(t => <TourRow key={t.id} tour={t} />)}
            {upcoming.length === 0 && <div style={{ fontSize: 12, color: '#bbb', padding: '8px 4px' }}>No upcoming tours.</div>}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#888', marginBottom: 10 }}>Past / Other ({past.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {past.map(t => <TourRow key={t.id} tour={t} />)}
            {past.length === 0 && <div style={{ fontSize: 12, color: '#bbb', padding: '8px 4px' }}>Nothing here yet.</div>}
          </div>
        </>
      )}
    </div>
  );
}
