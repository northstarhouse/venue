import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const gold = '#886c44';

const SCHEDULE_COLUMNS = ['Outdoor Setup', 'House Access', 'Guests Arrive', 'Ceremony', 'Cocktail Hour', 'Dining', 'Guests Leave', 'Out Time'];

// Matched in order against each itinerary segment's label text (first match wins).
const SCHEDULE_KEYWORDS = [
  ['Outdoor Setup', /\bsetup\b/i],
  ['House Access', /\bhouse access|inside access\b/i],
  ['Guests Arrive', /\bguests? arriv/i],
  ['Ceremony', /\bceremony\b/i],
  ['Cocktail Hour', /\bcocktail/i],
  ['Dining', /\bdinner|dining|reception meal\b/i],
  ['Guests Leave', /\bguests? leave|departure/i],
  ['Out Time', /\bout time|vendors? out|load.?out|cleanup complete/i],
];

// Parses free-text itineraries like "10am outdoor setup, 2pm house access,
// 4:30-5:30pm cocktail hour" into { column: timeString }. Segments that
// don't match a known column are returned separately so nothing is silently
// dropped — they're shown to the site manager to fill in by hand.
function parseItinerary(text) {
  const schedule = {};
  const unmatched = [];
  if (!text) return { schedule, unmatched };

  const timePattern = /^(\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?)\s+(.+)$/i;
  text.split(/[,;\n]/).map(s => s.trim()).filter(Boolean).forEach(segment => {
    const m = segment.match(timePattern);
    if (!m) { unmatched.push(segment); return; }
    const [, time, label] = m;
    const hit = SCHEDULE_KEYWORDS.find(([, re]) => re.test(label));
    if (hit) schedule[hit[0]] = time.replace(/\s+/g, '');
    else unmatched.push(segment);
  });
  return { schedule, unmatched };
}

const CHECKLIST_PAGE_1 = [
  { room: 'Terrace & West Lawn', items: ['Outside lights on', 'Lawn cleared and tidy'] },
  { room: 'Living Room', items: ['Lights on'] },
  { room: 'Library', items: ['Lights on', 'Chairs off table', 'Doors unlocked'] },
  { room: 'Julia Morgan Room', items: ['Lights on', 'Doors unlocked', 'Chairs off tables', 'Coat rack from foyer', 'Waste basket lined', 'Put away decor items (See SM Guidebook)'] },
  { room: 'Restrooms & Foyer', items: ['Lights on', 'Cans lined', 'Paper products stocked'] },
  { room: 'Courtyard & East Lawn', items: ['Twinkle lights on', 'Courtyard lights on', 'Lawn lights on'] },
  { room: 'Parking Lot', items: ['Flood lights on'] },
  { room: 'Garden', items: ['Unlock', 'Clear & clean'] },
];

const CHECKLIST_PAGE_2 = [
  { room: 'Outdoor Restrooms', items: ['Breaker on', 'Doors unlocked', 'Lights on', 'Paper products stocked', 'Cans lined'] },
  { room: 'Kitchen', items: ['Lights on', 'Contact info posted on fridge', 'Supply bin stocked', 'Can liners available', 'Pantry locked', 'Counters clear', 'Fridge turned on', 'Restroom stocked'] },
  { room: 'Trash Corral', items: ['Plug in walkway lights', 'Place trash & recycle bins out'] },
  { room: 'Dining Room', items: ['Lights on', 'Chairs off tables', 'Table sleeves on', 'Porch door locked'] },
  { room: 'Mudroom & Study', items: ['Lights on', 'Wastebasket lined', 'Mirrors from foyer in place', 'Clothing rack pulled out'] },
];

function WalkThroughPage({ sections }) {
  return (
    <div className="page-break" style={{ maxWidth: 760, margin: '24px auto 0', padding: '28px 24px' }}>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Cardo', serif", textAlign: 'center', color: gold, marginBottom: 16 }}>Walk-Through &amp; Checklist</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th></th>
            <th style={{ fontSize: 11, fontWeight: 700, color: '#555', padding: '0 0 6px' }}>Before</th>
            <th style={{ fontSize: 11, fontWeight: 700, color: '#555', padding: '0 0 6px' }}>After</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(s => (
            <tr key={s.room}>
              <td style={{ verticalAlign: 'top', padding: '10px 12px 10px 0', width: '58%' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.room}</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: '#555', lineHeight: 1.6 }}>
                  {s.items.map(it => <li key={it}>{it}</li>)}
                </ul>
              </td>
              <td style={{ verticalAlign: 'top', padding: '10px 6px' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: 3, minHeight: 18 + s.items.length * 16 }}>&nbsp;</div>
              </td>
              <td style={{ verticalAlign: 'top', padding: '10px 0 10px 6px' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: 3, minHeight: 18 + s.items.length * 16 }}>&nbsp;</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
  const { schedule: parsedSchedule } = parseItinerary(a.q39vtj2z);
  if (a.efbv357w && !parsedSchedule['Outdoor Setup']) parsedSchedule['Outdoor Setup'] = a.efbv357w;
  const PAYMENTS_MADE = ['payment_retainer_paid', 'payment_installment_1_paid', 'payment_installment_2_paid', 'payment_deposit_paid'].filter(k => inquiry[k]).length;

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
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 40px' }}>
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
                <td key={c} style={{ border: '1px solid #ccc', height: 32, fontSize: 11, textAlign: 'center', padding: 3, fontWeight: 600 }}>
                  {parsedSchedule[c] || ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.8, marginBottom: 4, marginTop: 20 }}>
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

        <div style={{ fontSize: 12, fontWeight: 700, color: gold, marginTop: 16, marginBottom: 8 }}>Site Manager Notes</div>
        {[1, 2, 3].map(i => <div key={i} style={{ borderBottom: '1px solid #ccc', minHeight: 20, marginTop: 6 }}>&nbsp;</div>)}

        <div style={{ marginTop: 20, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11, fontWeight: 700 }}>
          <div style={{ color: inquiry.insurance_uploaded_at ? '#2e7d32' : '#c0392b' }}>
            Insurance certificate: {inquiry.insurance_uploaded_at ? `Received ${new Date(inquiry.insurance_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'NOT RECEIVED'}
          </div>
          <div style={{ color: PAYMENTS_MADE === 4 ? '#2e7d32' : '#c0392b' }}>
            Payments: {PAYMENTS_MADE}/4 made
          </div>
        </div>
      </div>

      {/* ── Pages 2 & 3: Walk-Through & Checklist ── */}
      <WalkThroughPage sections={CHECKLIST_PAGE_1} />
      <WalkThroughPage sections={CHECKLIST_PAGE_2} />

      {/* ── Page 4 top: Site Manager sign-off ── */}
      <div className="page-break" style={{ maxWidth: 760, margin: '24px auto 0', padding: '24px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: gold, textAlign: 'center', marginBottom: 14 }}>Top Half to Be Completed by Site Manager</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px', marginBottom: 16, fontSize: 12 }}>
          {['All rentals put away', 'Trash & recycling handled properly', 'No pets on site', 'No evidence of smoking or fire'].map(label => (
            <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 40%', minWidth: 200 }}>
              <span style={{ width: 14, height: 14, border: '1px solid #999', display: 'inline-block', flexShrink: 0 }} />
              {label}
            </label>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Areas of Immediate Attention/Need</div>
        <div style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic', marginBottom: 4 }}>(i.e. extra hours added, maintenance needs, event mishaps)</div>
        {[1, 2].map(i => <div key={i} style={{ borderBottom: '1px solid #ccc', minHeight: 18, marginBottom: 6 }}>&nbsp;</div>)}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '16px 0' }}>
          <BlankLine label="Time In" />
          <BlankLine label="Time Out" />
          <BlankLine label="Total Hours" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <BlankLine label="Site Manager" />
          <BlankLine label="Signature" />
        </div>
      </div>

      {/* ── Page 4 bottom: Security Deposit Accounting Form ── */}
      <div style={{ maxWidth: 760, margin: '0 auto 60px', padding: '20px 24px 28px' }}>
        <div style={{ fontSize: 10, color: '#888', textAlign: 'center', marginBottom: 12 }}>Bottom Half of Page to Be Completed by Management</div>
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
