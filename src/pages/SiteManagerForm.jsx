import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const QUESTIONNAIRE_FORM_ID = 'e9be06b9-6788-41bc-a78a-28e02b8b749a';
const gold = '#886c44';

function formatAnswer(field, value) {
  if (value == null || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (field?.type === 'yes_no') return value;
  return String(value);
}

export default function SiteManagerForm({ inquiryId }) {
  const [inquiry, setInquiry] = useState(undefined);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [{ data: inq, error: inqErr }, { data: form, error: formErr }] = await Promise.all([
        supabase.from('venue_inquiries').select('*').eq('id', inquiryId).maybeSingle(),
        supabase.from('nsh_forms').select('fields').eq('id', QUESTIONNAIRE_FORM_ID).maybeSingle(),
      ]);
      if (inqErr || !inq) { setError('Inquiry not found.'); return; }
      if (formErr) { setError(formErr.message); return; }
      setInquiry(inq);
      setFields(form?.fields || []);
    }
    load();
  }, [inquiryId]);

  if (error) return <div style={{ padding: 40, color: '#c0392b' }}>{error}</div>;
  if (!inquiry) return <div style={{ padding: 40, color: '#999' }}>Loading…</div>;

  const answers = inquiry.questionnaire_answers || {};
  const eventDateStr = inquiry.event_date ? new Date(inquiry.event_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#2a2a2a', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print" style={{ background: '#2a2a2e', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="assets/logo.png" alt="North Star House" style={{ height: 36 }} />
        <button onClick={() => window.print()} className="btn-gold" style={{ padding: '9px 18px' }}>Print</button>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Cardo', serif", marginBottom: 4 }}>Site Manager Form</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>{inquiry.name}</div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28, fontSize: 13 }}>
          <tbody>
            <tr><td style={{ padding: '6px 0', color: '#888', width: 180 }}>Event date</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{eventDateStr}</td></tr>
            <tr><td style={{ padding: '6px 0', color: '#888' }}>Guest count</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{inquiry.guest_count ?? '—'}</td></tr>
            <tr><td style={{ padding: '6px 0', color: '#888' }}>Primary contact</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{inquiry.name} · {inquiry.phone || '—'} · {inquiry.email || '—'}</td></tr>
            <tr><td style={{ padding: '6px 0', color: '#888' }}>Partner</td><td style={{ padding: '6px 0', fontWeight: 600 }}>{inquiry.partner_name || '—'}</td></tr>
            {inquiry.additional_contacts && (
              <tr><td style={{ padding: '6px 0', color: '#888', verticalAlign: 'top' }}>Additional contacts</td><td style={{ padding: '6px 0', whiteSpace: 'pre-wrap' }}>{inquiry.additional_contacts}</td></tr>
            )}
            <tr>
              <td style={{ padding: '6px 0', color: '#888' }}>Insurance certificate</td>
              <td style={{ padding: '6px 0', fontWeight: 600, color: inquiry.insurance_uploaded_at ? '#2e7d32' : '#c0392b' }}>
                {inquiry.insurance_uploaded_at ? `Received ${new Date(inquiry.insurance_uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Not received'}
              </td>
            </tr>
          </tbody>
        </table>

        {!inquiry.questionnaire_answers ? (
          <div style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>Questionnaire not yet submitted.</div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Cardo', serif", marginBottom: 14, borderBottom: `2px solid ${gold}`, paddingBottom: 6 }}>Wedding Day Questionnaire</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {fields.filter(f => f.id !== 'nzic6lad').map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 12px 10px 0', fontSize: 12, fontWeight: 600, color: '#555', width: '42%', verticalAlign: 'top' }}>{f.label}</td>
                    <td style={{ padding: '10px 0', fontSize: 13, verticalAlign: 'top' }}>{formatAnswer(f, answers[f.id])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
