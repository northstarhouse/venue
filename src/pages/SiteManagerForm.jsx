import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const gold = '#886c44';

const SCHEDULE_COLUMNS = ['Outdoor Setup', 'House Access', 'Guests Arrive', 'Ceremony', 'Cocktail Hour', 'Dining', 'Guests Leave', 'Out Time'];

function Line({ label, value, wide }) {
  return (
    <div style={{ flex: wide ? '1 1 100%' : '1 1 45%', minWidth: 160, marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, borderBottom: '1px solid #ccc', minHeight: 20, paddingTop: 2 }}>{value || ' '}</div>
    </div>
  );
}

function BlankLine({ label }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ borderBottom: '1px solid #ccc', minHeight: 20 }}>&nbsp;</div>
    </div>
  );
}

export default function SiteManagerForm({ inquiryId }) {
  const [inquiry, setInquiry] = useState(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('venue_inquiries').select('*').eq('id', inquiryId).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setError('Inquiry not found.'); return; }
      setInquiry(data);
    });
  }, [inquiryId]);

  if (error) return <div style={{ padding: 40, color: '#c0392b' }}>{error}</div>;
  if (!inquiry) return <div style={{ padding: 40, color: '#999' }}>Loading…</div>;

  const a = inquiry.questionnaire_answers || {};
  const eventDateStr = inquiry.event_date ? new Date(inquiry.event_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#2a2a2a', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print" style={{ background: '#2a2a2e', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="assets/logo.png" alt="North Star House" style={{ height: 36 }} />
        <button onClick={() => window.print()} className="btn-gold" style={{ padding: '9px 18px' }}>Print</button>
      </div>

      {!inquiry.questionnaire_answers && (
        <div className="no-print" style={{ maxWidth: 760, margin: '20px auto 0', fontSize: 13, color: '#c0392b', background: '#fbe9e7', borderRadius: 8, padding: '10px 14px' }}>
          Questionnaire not yet submitted — fields below are blank until the couple completes it.
        </div>
      )}

      {/* ── Page 1: Event Information for Site Managers ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 40px', border: `2px solid ${gold}`, borderRadius: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cardo', serif", textAlign: 'center', color: gold, marginBottom: 20 }}>Event Information for Site Managers</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
          <Line label="Event Name" value={inquiry.name} wide />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
          <Line label="Date" value={eventDateStr} />
          <Line label="Day-of Coordinator" value={a.lgznkge3} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <BlankLine label="Site Manager" />
          <BlankLine label="Contract Administrator" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <Line label="Guests" value={a.pqv3xvhy || inquiry.guest_count} />
          <Line label="Round Tables (60&quot;)" value={a.u1dxrj93} />
          <Line label="Rectangle Tables 6'" value={a.fqexadj0} />
          <Line label="Rectangle Tables 8'" value={a['0b8exqpj']} />
          <Line label="Chairs" value={a['9d4w1mtr']} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Cardo', serif", color: gold, marginBottom: 10 }}>Schedule of Event Activities</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead>
            <tr>
              {SCHEDULE_COLUMNS.map(c => (
                <th key={c} style={{ border: '1px solid #ccc', fontSize: 9, padding: '4px 3px', fontWeight: 600, color: '#555' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {SCHEDULE_COLUMNS.map(c => (
                <td key={c} style={{ border: '1px solid #ccc', height: 32, fontSize: 11, textAlign: 'center', padding: 3 }}>
                  {c === 'Outdoor Setup' ? (a.efbv357w || '') : ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {a.q39vtj2z && (
          <div style={{ fontSize: 11, color: '#666', marginBottom: 20, background: '#faf8f5', padding: '8px 10px', borderRadius: 6 }}>
            <strong>Itinerary from couple (transcribe into table above):</strong> {a.q39vtj2z}
          </div>
        )}

        <BlankLine label="Cleanup is to be completed no later than" />

        <div style={{ fontSize: 12, fontWeight: 700, color: gold, marginTop: 20, marginBottom: 8 }}>Site Manager Notes</div>
        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.8, marginBottom: 4 }}>
          {a.sv64qk5f && <div>Decorating inside house: <strong>{a.sv64qk5f}</strong></div>}
          {a.w25d5otp && <div>Ceremony location: <strong>{a.w25d5otp}</strong></div>}
          {a['05wji2y0'] && <div>Dining location: <strong>{a['05wji2y0']}</strong></div>}
          {Array.isArray(a['7xqk8pj0']) && a['7xqk8pj0'].length > 0 && <div>Additional areas in use: <strong>{a['7xqk8pj0'].join(', ')}</strong></div>}
          {a.y7iss6kf && <div>Photo sharing permission: <strong>{a.y7iss6kf}</strong></div>}
          {a.ct8rut5k && <div>Catering: <strong>{a.ct8rut5k}</strong></div>}
          {a.x69x2wmp && <div>DJ: <strong>{a.x69x2wmp}</strong></div>}
          {a['1nlza3rt'] && <div>Photographer: <strong>{a['1nlza3rt']}</strong></div>}
          {a['7xbg0y8j'] && <div>Rental company: <strong>{a['7xbg0y8j']}</strong></div>}
          {a.ebr3yi5m && <div>Other vendors: <strong>{a.ebr3yi5m}</strong></div>}
        </div>
        {[1, 2, 3].map(i => <div key={i} style={{ borderBottom: '1px solid #ccc', minHeight: 20, marginTop: 6 }}>&nbsp;</div>)}

        <div style={{ marginTop: 20, fontSize: 11, color: inquiry.insurance_uploaded_at ? '#2e7d32' : '#c0392b', fontWeight: 700 }}>
          Insurance certificate: {inquiry.insurance_uploaded_at ? `Received ${new Date(inquiry.insurance_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'NOT RECEIVED'}
        </div>
      </div>

      {/* ── Security Deposit Accounting Form ── */}
      <div className="page-break" style={{ maxWidth: 760, margin: '24px auto 60px', padding: '28px 24px', border: `2px solid ${gold}`, borderRadius: 4 }}>
        <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Cardo', serif", textAlign: 'center', color: gold, marginBottom: 20 }}>Security Deposit Accounting Form</div>

        <Line label="Event Name & Date" value={`${inquiry.name}${eventDateStr ? ' — ' + eventDateStr : ''}`} wide />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6 }}>
          <Line label="Refund Check Payable To" value={a['2tywmjis']} wide />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6, marginBottom: 20 }}>
          <Line label="Mail Check To" value={a.qwb19pxp} wide />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <BlankLine label="Event Cost" />
          <BlankLine label="Security Deposit" />
          <BlankLine label="Refund Amount" />
        </div>

        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>If the entire deposit is not being returned, please specify why:</div>
        {[1, 2, 3].map(i => <div key={i} style={{ borderBottom: '1px solid #ccc', minHeight: 20, marginTop: 6 }}>&nbsp;</div>)}
      </div>
    </div>
  );
}
