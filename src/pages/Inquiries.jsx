import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';

const gold = '#886c44';
const STATUSES = ['New', 'Initial Inquiry Sent', 'Follow Up Sent', 'Final Follow Up Sent', 'Tour Scheduled', 'Toured - Docs Sent', 'Booking', 'Proposal Sent', 'Booked', 'Declined', 'Archive'];
const STATUS_COLORS = {
  'New': { bg: '#fff3e0', fg: '#e6862b' },
  'Initial Inquiry Sent': { bg: '#e3f2fd', fg: '#1976d2' },
  'Follow Up Sent': { bg: '#e0f2f1', fg: '#00897b' },
  'Final Follow Up Sent': { bg: '#fff8e1', fg: '#b8860b' },
  'Tour Scheduled': { bg: '#f3e5f5', fg: '#7c3aed' },
  'Toured - Docs Sent': { bg: '#ede7f6', fg: '#5e35b1' },
  'Booking': { bg: '#fff3e0', fg: '#c77700' },
  'Proposal Sent': { bg: '#e0f7fa', fg: '#00838f' },
  'Booked': { bg: '#e8f5e9', fg: '#2e7d32' },
  'Declined': { bg: '#fbe9e7', fg: '#c0392b' },
  'Archive': { bg: '#f0f0f0', fg: '#888' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.New;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.fg, padding: '2px 10px', borderRadius: 20 }}>{status}</span>
  );
}

function NewInquiryForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', event_type: '', event_date: '', guest_count: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    setBusy(true); setErr('');
    const { data, error } = await supabase.from('venue_inquiries').insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      event_type: form.event_type.trim() || null,
      event_date: form.event_date || null,
      guest_count: form.guest_count ? parseInt(form.guest_count, 10) : null,
      message: form.message.trim() || null,
      status: 'New',
    }).select();
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onCreated(data[0]);
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#2a2a2a' }}>New Inquiry</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input className="input" placeholder="Name *" value={form.name} onChange={e => set('name', e.target.value)} required />
        <input className="input" placeholder="Event type (e.g. Wedding)" value={form.event_type} onChange={e => set('event_type', e.target.value)} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} />
        <input className="input" placeholder="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <input className="input" type="date" placeholder="Event date" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Guest count" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} />
      </div>
      <textarea className="input" placeholder="Message / details" value={form.message} onChange={e => set('message', e.target.value)} rows={3} style={{ marginBottom: 10, resize: 'vertical' }} />
      {err && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn-gold" disabled={busy}>{busy ? 'Saving…' : 'Add Inquiry'}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function InquiryCard({ inquiry, onUpdate }) {
  const [notes, setNotes] = useState(inquiry.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [proposalError, setProposalError] = useState('');

  async function changeStatus(status) {
    const { data, error } = await supabase.from('venue_inquiries').update({ status }).eq('id', inquiry.id).select();
    if (!error && data?.[0]) onUpdate(data[0]);
  }

  async function sendProposal() {
    setSendingProposal(true);
    setProposalError('');
    const { data, error } = await supabase.functions.invoke('process-venue-pipeline', {
      body: { action: 'send_proposal', inquiryId: inquiry.id },
    });
    setSendingProposal(false);
    if (error || data?.error) { setProposalError(error?.message || data?.error || 'Failed to send proposal.'); return; }
    onUpdate({ ...inquiry, status: 'Proposal Sent', proposal_sent_at: new Date().toISOString() });
  }

  async function saveNotes() {
    setSavingNotes(true);
    const { data, error } = await supabase.from('venue_inquiries').update({ notes }).eq('id', inquiry.id).select();
    setSavingNotes(false);
    if (!error && data?.[0]) onUpdate(data[0]);
  }

  const dateStr = inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const eventDateStr = inquiry.event_date ? new Date(inquiry.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>{inquiry.name}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>Inquired {dateStr}{inquiry.event_type ? ` · ${inquiry.event_type}` : ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {inquiry.source === 'website' && (
            <span style={{ fontSize: 10, fontWeight: 700, background: '#eef2ff', color: '#4f46e5', padding: '2px 9px', borderRadius: 20 }}>via website</span>
          )}
          <StatusBadge status={inquiry.status} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#666', marginBottom: 10 }}>
        {inquiry.email && <a href={`mailto:${inquiry.email}`} style={{ color: gold, textDecoration: 'none' }}>{inquiry.email}</a>}
        {inquiry.phone && <span>{inquiry.phone}</span>}
        {eventDateStr && <span>Event date: {eventDateStr}</span>}
        {inquiry.guest_count != null && <span>{inquiry.guest_count} guests</span>}
      </div>

      {inquiry.message && (
        <div style={{ fontSize: 13, color: '#444', background: 'var(--light)', borderRadius: 8, padding: '10px 12px', marginBottom: 10, whiteSpace: 'pre-wrap' }}>
          {inquiry.message}
        </div>
      )}

      {inquiry.status === 'Booking' && (
        <div style={{ border: `1.5px solid ${gold}`, background: '#faf7f2', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: gold, marginBottom: 8 }}>Ready for Review</div>
          <div style={{ fontSize: 13, color: '#444', lineHeight: 1.8, marginBottom: 12 }}>
            <strong>Partner:</strong> {inquiry.partner_name || '—'}<br />
            <strong>Confirmed date:</strong> {inquiry.event_date ? new Date(inquiry.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}<br />
            {inquiry.additional_contacts && <><strong>Additional contacts:</strong> {inquiry.additional_contacts}</>}
          </div>
          {proposalError && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 10 }}>{proposalError}</div>}
          <button className="btn-gold" disabled={sendingProposal} onClick={sendProposal}>
            {sendingProposal ? 'Sending…' : 'Reviewed — Send Proposal'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => changeStatus(s)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
              border: '1px solid ' + (s === inquiry.status ? gold : 'var(--border)'),
              background: s === inquiry.status ? gold : '#fff',
              color: s === inquiry.status ? '#fff' : '#888',
            }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <input className="input" placeholder="Internal notes…" value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes} style={{ fontSize: 12 }} />
        {savingNotes && <span style={{ fontSize: 10, color: '#bbb', paddingTop: 8 }}>saving…</span>}
      </div>
    </div>
  );
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    supabase.from('venue_inquiries').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) { setError(error.message); setLoading(false); return; }
      setInquiries(data || []);
      setLoading(false);
    });
  }, []);

  function handleCreated(row) {
    setInquiries(prev => [row, ...prev]);
    setShowForm(false);
  }

  function handleUpdate(row) {
    setInquiries(prev => prev.map(i => i.id === row.id ? row : i));
  }

  const visible = filter === 'All' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif" }}>Inquiries</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Venue rental inquiries and lead tracking</div>
        </div>
        {!showForm && <button className="btn-gold" onClick={() => setShowForm(true)}>+ New Inquiry</button>}
      </div>

      <div style={{ height: 18 }} />

      {showForm && <NewInquiryForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {['All', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
              border: '1px solid ' + (s === filter ? gold : 'var(--border)'),
              background: s === filter ? gold : '#fff',
              color: s === filter ? '#fff' : '#888',
            }}>
            {s}{s !== 'All' ? ` (${inquiries.filter(i => i.status === s).length})` : ` (${inquiries.length})`}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: '#aaa', fontSize: 13, padding: 40, textAlign: 'center' }}>Loading inquiries…</div>}
      {error && <div style={{ color: '#c62828', fontSize: 12, background: '#ffebee', borderRadius: 8, padding: 16 }}>Could not load inquiries: {error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(i => <InquiryCard key={i.id} inquiry={i} onUpdate={handleUpdate} />)}
          {visible.length === 0 && (
            <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
              No inquiries {filter !== 'All' ? `with status "${filter}"` : 'yet'}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
