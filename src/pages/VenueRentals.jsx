import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase.js';
import { fetchCalendarEvents, parseIcalDate } from '../lib/ical.js';

const gold = '#886c44';

function Checkbox({ checked, onChange, label, color }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange} style={{ width: 18, height: 18, borderRadius: 4, border: '1.5px solid ' + (checked ? color : '#d0c8bc'), background: checked ? color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', cursor: 'pointer' }}>
        {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>}
      </div>
      <span style={{ fontSize: 12, color: checked ? color : '#999', fontWeight: checked ? 600 : 400 }}>{label}</span>
    </label>
  );
}

export default function VenueRentals() {
  const [weddings, setWeddings] = useState([]);
  const [tracking, setTracking] = useState({});
  const [loading, setLoading] = useState(true);
  const [calError, setCalError] = useState(null);
  const [savingUid, setSavingUid] = useState(null);
  const [editingField, setEditingField] = useState(null); // { uid, field: 'ig'|'album', val }
  const debounceTimers = useRef({});

  useEffect(() => {
    async function load() {
      try {
        const [events, trackRows] = await Promise.all([
          fetchCalendarEvents(),
          supabase.from('venue_wedding_tracking').select('*').order('event_date', { ascending: true }).then(({ data, error }) => {
            if (error) throw error;
            return data || [];
          }),
        ]);

        const weds = events
          .filter((e) => e.SUMMARY && e.SUMMARY.toLowerCase().indexOf('wedding') !== -1)
          .map((e) => {
            const dt = parseIcalDate(e['DTSTART'] || e['DTSTART;VALUE=DATE'] || '');
            return { uid: e.UID || (e.SUMMARY + '_' + e.DTSTART), title: e.SUMMARY || 'Untitled', date: dt };
          })
          .filter((w) => w.date && w.date.getFullYear() >= 2026)
          .sort((a, b) => a.date - b.date);

        setWeddings(weds);
        const map = {};
        trackRows.forEach((r) => { map[r.event_uid] = r; });
        setTracking(map);
        setLoading(false);
      } catch (err) {
        setCalError(err.message);
        setLoading(false);
      }
    }
    load();
  }, []);

  function getTrack(uid) {
    return tracking[uid] || { pictures_done: false, blog_done: false, socials_done: false, photographer_link: '', photo_album_link: '' };
  }

  async function saveTrack(uid, title, date, patch) {
    const existing = tracking[uid];
    const merged = Object.assign({}, getTrack(uid), patch);
    setTracking((prev) => Object.assign({}, prev, { [uid]: Object.assign({}, prev[uid] || {}, patch) }));
    setSavingUid(uid);
    const dateStr = date ? date.toISOString().slice(0, 10) : null;

    if (existing && existing.id) {
      const { data, error } = await supabase.from('venue_wedding_tracking').update(patch).eq('id', existing.id).select();
      if (!error && data && data[0]) setTracking((prev) => Object.assign({}, prev, { [uid]: data[0] }));
      setSavingUid(null);
    } else {
      const { data, error } = await supabase.from('venue_wedding_tracking').insert({
        event_uid: uid,
        event_title: title,
        event_date: dateStr,
        pictures_done: merged.pictures_done,
        blog_done: merged.blog_done,
        socials_done: merged.socials_done,
        photographer_link: merged.photographer_link || null,
        photo_album_link: merged.photo_album_link || null,
      }).select();
      if (!error && data && data[0]) setTracking((prev) => Object.assign({}, prev, { [uid]: data[0] }));
      setSavingUid(null);
    }
  }

  function handlePhotogChange(uid, title, date, val) {
    setTracking((prev) => Object.assign({}, prev, { [uid]: Object.assign({}, prev[uid] || {}, { photographer_link: val }) }));
    clearTimeout(debounceTimers.current[uid + '_ig']);
    debounceTimers.current[uid + '_ig'] = setTimeout(() => { saveTrack(uid, title, date, { photographer_link: val || null }); }, 700);
  }

  function handleAlbumChange(uid, title, date, val) {
    setTracking((prev) => Object.assign({}, prev, { [uid]: Object.assign({}, prev[uid] || {}, { photo_album_link: val }) }));
    clearTimeout(debounceTimers.current[uid + '_album']);
    debounceTimers.current[uid + '_album'] = setTimeout(() => { saveTrack(uid, title, date, { photo_album_link: val || null }); }, 700);
  }

  async function dismissWedding(w) {
    const existing = tracking[w.uid];
    const dateStr = w.date ? w.date.toISOString().slice(0, 10) : null;
    setTracking((prev) => Object.assign({}, prev, { [w.uid]: Object.assign({}, prev[w.uid] || {}, { hidden: true }) }));

    if (existing && existing.id) {
      await supabase.from('venue_wedding_tracking').update({ hidden: true }).eq('id', existing.id);
    } else {
      const { data } = await supabase.from('venue_wedding_tracking').insert({ event_uid: w.uid, event_title: w.title, event_date: dateStr, hidden: true }).select();
      if (data && data[0]) setTracking((prev) => Object.assign({}, prev, { [w.uid]: data[0] }));
    }
  }

  const now = new Date();
  const visible = weddings.filter((w) => !getTrack(w.uid).hidden);
  const past = visible.filter((w) => w.date < now);
  const upcoming = visible.filter((w) => w.date >= now);

  function WeddingCard(w) {
    const t = getTrack(w.uid);
    const allDone = t.pictures_done && t.blog_done && t.socials_done;
    const noneChecked = !t.pictures_done && !t.blog_done && !t.socials_done;
    const oneMonthAgo = new Date(now); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const overdue = noneChecked && w.date < oneMonthAgo;
    const isSaving = savingUid === w.uid;
    const dateStr = w.date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    const anyChecked = t.pictures_done || t.blog_done || t.socials_done;
    const borderColor = allDone ? '#c8e6c9' : anyChecked ? '#ffb74d' : overdue ? '#e57373' : '#e8e0d5';

    return (
      <div key={w.uid} style={{ background: '#fff', border: '0.5px solid ' + borderColor, borderRadius: 10, padding: '14px 18px', transition: 'border-color 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>{w.title}</div>
              {allDone && <span style={{ fontSize: 10, fontWeight: 700, background: '#e8f5e9', color: '#2e7d32', padding: '1px 8px', borderRadius: 20 }}>Complete</span>}
              {isSaving && <span style={{ fontSize: 10, color: '#bbb' }}>saving…</span>}
              <button onClick={() => { if (window.confirm('Remove "' + w.title + '" from this list?')) dismissWedding(w); }} title="Remove duplicate" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{dateStr}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
              {(editingField && editingField.uid === w.uid && editingField.field === 'ig') ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fce4f3', border: '0.5px solid #e8b4d8', borderRadius: 20, padding: '3px 12px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c13584" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#c13584" stroke="none" /></svg>
                  <input autoFocus value={editingField.val}
                    onChange={(e) => setEditingField((ef) => Object.assign({}, ef, { val: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { handlePhotogChange(w.uid, w.title, w.date, editingField.val); setEditingField(null); } if (e.key === 'Escape') setEditingField(null); }}
                    onBlur={() => { handlePhotogChange(w.uid, w.title, w.date, editingField.val); setEditingField(null); }}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, fontWeight: 600, color: '#c13584', width: 160 }} />
                </div>
              ) : t.photographer_link ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <a href={'https://instagram.com/' + t.photographer_link.replace(/^@/, '')} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fce4f3', border: '0.5px solid #e8b4d8', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#c13584', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                    {t.photographer_link.startsWith('@') ? t.photographer_link : '@' + t.photographer_link}
                  </a>
                  <button onClick={() => setEditingField({ uid: w.uid, field: 'ig', val: t.photographer_link || '' })} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: '0 2px', lineHeight: 1 }}>✎</button>
                </div>
              ) : (
                <button onClick={() => setEditingField({ uid: w.uid, field: 'ig', val: '' })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '0.5px dashed #d0c8bc', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#bbb', cursor: 'pointer' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                  @photographer
                </button>
              )}
              {(editingField && editingField.uid === w.uid && editingField.field === 'album') ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f0e8', border: '0.5px solid #d4c4a0', borderRadius: 20, padding: '3px 12px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <input autoFocus value={editingField.val}
                    onChange={(e) => setEditingField((ef) => Object.assign({}, ef, { val: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { handleAlbumChange(w.uid, w.title, w.date, editingField.val); setEditingField(null); } if (e.key === 'Escape') setEditingField(null); }}
                    onBlur={() => { handleAlbumChange(w.uid, w.title, w.date, editingField.val); setEditingField(null); }}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, fontWeight: 600, color: gold, width: 140 }} />
                </div>
              ) : t.photo_album_link ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <a href={t.photo_album_link.startsWith('http') ? t.photo_album_link : 'https://' + t.photo_album_link} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f0e8', border: '0.5px solid #d4c4a0', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: gold, textDecoration: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    Photo Album
                  </a>
                  <button onClick={() => setEditingField({ uid: w.uid, field: 'album', val: t.photo_album_link || '' })} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: '0 2px', lineHeight: 1 }}>✎</button>
                </div>
              ) : (
                <button onClick={() => setEditingField({ uid: w.uid, field: 'album', val: '' })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '0.5px dashed #d0c8bc', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#bbb', cursor: 'pointer' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  Photo Album
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 2 }}>
            <Checkbox checked={!!t.pictures_done} label="Pictures" color="#7c3aed"
              onChange={() => saveTrack(w.uid, w.title, w.date, { pictures_done: !t.pictures_done })} />
            <Checkbox checked={!!t.blog_done} label="Blog" color={gold}
              onChange={() => saveTrack(w.uid, w.title, w.date, { blog_done: !t.blog_done })} />
            <Checkbox checked={!!t.socials_done} label="Socials" color="#e91e8c"
              onChange={() => saveTrack(w.uid, w.title, w.date, { socials_done: !t.socials_done })} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#2a2a2a', fontFamily: "'Cardo', serif", marginBottom: 6 }}>After Event Flow</div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>Wedding tracking and post-event checklist</div>

      {loading && <div style={{ color: '#aaa', fontSize: 13, padding: 40, textAlign: 'center' }}>Loading calendar…</div>}
      {calError && <div style={{ color: '#c62828', fontSize: 12, background: '#ffebee', borderRadius: 8, padding: 16 }}>Could not load calendar: {calError}</div>}

      {!loading && !calError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {upcoming.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#888', marginBottom: 10 }}>Upcoming Weddings ({upcoming.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{upcoming.map(WeddingCard)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#888', marginBottom: 10 }}>Past Weddings ({past.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{past.sort((a, b) => b.date - a.date).map(WeddingCard)}</div>
            </div>
          )}
          {weddings.length === 0 && (
            <div style={{ background: '#fff', border: '0.5px solid #e8e0d5', borderRadius: 12, padding: 40, textAlign: 'center', color: '#bbb', fontSize: 13 }}>No weddings found in the calendar.</div>
          )}
        </div>
      )}
    </div>
  );
}
