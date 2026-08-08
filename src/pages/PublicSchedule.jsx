import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const gold = '#886c44';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
}

export default function PublicSchedule({ inquiryId, preselectedSlotId }) {
  const [inquiry, setInquiry] = useState(undefined);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);
  const [showAllTimes, setShowAllTimes] = useState(!preselectedSlotId);

  useEffect(() => {
    async function load() {
      const { data: inq, error: inqErr } = await supabase.from('venue_inquiries').select('*').eq('id', inquiryId).maybeSingle();
      if (inqErr || !inq) { setError('We could not find your inquiry. Please contact us directly.'); setLoading(false); return; }
      setInquiry(inq);

      const nowIso = new Date().toISOString();
      const { data: slotRows, error: slotErr } = await supabase
        .from('venue_tour_availability')
        .select('*, venue_tour_hosts(id,name)')
        .eq('is_booked', false)
        .gt('slot_start', nowIso)
        .order('slot_start', { ascending: true });
      if (slotErr) { setError(slotErr.message); setLoading(false); return; }
      setSlots(slotRows || []);
      setLoading(false);
    }
    load();
  }, [inquiryId]);

  async function bookSlot(slot) {
    setBooking(true);
    setError('');

    const { data: claimed, error: claimErr } = await supabase
      .from('venue_tour_availability')
      .update({ is_booked: true })
      .eq('id', slot.id)
      .eq('is_booked', false)
      .select();

    if (claimErr || !claimed || claimed.length === 0) {
      setError('Sorry, that time was just booked by someone else. Please pick another.');
      setSlots(prev => prev.filter(s => s.id !== slot.id));
      setShowAllTimes(true);
      setBooking(false);
      return;
    }

    const { data: tour, error: tourErr } = await supabase.from('venue_tours').insert({
      inquiry_id: inquiry.id,
      host_id: slot.host_id,
      availability_id: slot.id,
      slot_start: slot.slot_start,
      slot_end: slot.slot_end,
      status: 'Scheduled',
    }).select().single();

    if (tourErr) {
      // best-effort release of the slot if the tour insert failed
      await supabase.from('venue_tour_availability').update({ is_booked: false }).eq('id', slot.id);
      setError('Something went wrong booking your tour. Please try again.');
      setBooking(false);
      return;
    }

    setBooked({ ...tour, host: slot.venue_tour_hosts });
    setBooking(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Loading…</div>
      </div>
    );
  }

  const preselected = preselectedSlotId ? slots.find(s => String(s.id) === String(preselectedSlotId)) : null;
  const otherSlots = preselected ? slots.filter(s => s.id !== preselected.id) : slots;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="assets/logo.png" alt="North Star House" style={{ width: 220, margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif" }}>Schedule Your Tour</div>
        </div>

        {error && <div style={{ color: '#c0392b', fontSize: 13, background: '#fbe9e7', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>{error}</div>}

        {booked ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>Tour Confirmed!</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
              {fmtDate(booked.slot_start)}
              <br />
              {fmtTime(booked.slot_start)}
              {booked.host?.name ? ` with ${booked.host.name}` : ''}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 14 }}>A confirmation email is on its way to you.</div>
          </div>
        ) : !inquiry ? null : (
          <>
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: '#666' }}>Hi <strong>{inquiry.name}</strong> — pick a time below to tour North Star House with Jen or Sierra.</div>
            </div>

            {preselectedSlotId && !preselected && (
              <div style={{ fontSize: 12, color: '#999', background: '#fff', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                That time is no longer available — please choose another below.
              </div>
            )}

            {preselected && (
              <div style={{ marginBottom: 18 }}>
                <div className="card" style={{ border: `1.5px solid ${gold}`, background: '#faf7f2' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: gold, marginBottom: 8 }}>Your Requested Time</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#2a2a2a' }}>{fmtDate(preselected.slot_start)}</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>{fmtTime(preselected.slot_start)} with {preselected.venue_tour_hosts?.name || 'our team'}</div>
                  <button disabled={booking} onClick={() => bookSlot(preselected)} className="btn-gold" style={{ width: '100%', padding: '11px' }}>
                    {booking ? 'Booking…' : 'Confirm This Time'}
                  </button>
                </div>
                {!showAllTimes && (
                  <button onClick={() => setShowAllTimes(true)} style={{ background: 'none', border: 'none', color: gold, fontSize: 12, cursor: 'pointer', marginTop: 10, padding: 0 }}>
                    Choose a different time →
                  </button>
                )}
              </div>
            )}

            {showAllTimes && (
              <>
                {otherSlots.length === 0 && !preselected && (
                  <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 12, padding: 30, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
                    No open tour times right now — please reach out to us directly to find a time.
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {otherSlots.map(slot => (
                    <button key={slot.id} disabled={booking} onClick={() => bookSlot(slot)} className="card"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: booking ? 'default' : 'pointer', border: '0.5px solid var(--border)', textAlign: 'left', width: '100%' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>{fmtDate(slot.slot_start)} · {fmtTime(slot.slot_start)}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>with {slot.venue_tour_hosts?.name || 'our team'}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: gold }}>Select →</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
