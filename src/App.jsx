import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, initialAuthType } from './supabase.js';
import Sidebar from './components/Sidebar.jsx';
import VenueRentals from './pages/VenueRentals.jsx';
import Inquiries from './pages/Inquiries.jsx';
import TourBookings from './pages/TourBookings.jsx';
import PublicSchedule from './pages/PublicSchedule.jsx';
import { NAV_ITEMS, NavIcon } from './nav.jsx';

const publicScheduleId = new URLSearchParams(window.location.search).get('schedule');

export const VenueContext = createContext(null);
export const useVenue = () => useContext(VenueContext);

// ── Auth Screen ───────────────────────────────────────────────────────────────

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message || 'Incorrect email or password. Make sure your account has been set up.');
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email) { setErr('Enter your email first.'); return; }
    setBusy(true); setErr('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
    if (error) { setErr(error.message); setBusy(false); return; }
    setMsg('Check your email for a reset link.');
    setBusy(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 18, padding: '40px 36px', width: '100%', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', fontFamily: "'Cardo','Georgia',serif", marginBottom: 4 }}>North Star House</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 28 }}>Venue</div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {err && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 12 }}>{err}</div>}
            <button type="submit" className="btn-gold" disabled={busy} style={{ width: '100%', padding: '11px', fontSize: 14 }}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
            <div style={{ marginTop: 14 }}>
              <button type="button" onClick={() => { setMode('reset'); setErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                Forgot password?
              </button>
            </div>
            <div style={{ marginTop: 18, fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
              Access is by invitation only.<br />Contact an admin if you need an account.
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 14 }}>Enter your email and we'll send a reset link.</div>
            <div style={{ marginBottom: 14 }}>
              <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {err && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 12 }}>{err}</div>}
            {msg && <div style={{ color: '#2e7d32', fontSize: 12, marginBottom: 12 }}>{msg}</div>}
            <button type="submit" className="btn-gold" disabled={busy} style={{ width: '100%', padding: '11px', fontSize: 14 }}>
              {busy ? 'Sending…' : 'Send Reset Link'}
            </button>
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => { setMode('login'); setErr(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                ← Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Set Password Screen (after invite/reset link) ─────────────────────────────

function SetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setErr('Passwords do not match.'); return; }
    if (password.length < 8) { setErr('Must be at least 8 characters.'); return; }
    setBusy(true); setErr('');
    const { error } = await supabase.auth.updateUser({ password, data: { must_change_password: false } });
    if (error) { setErr(error.message); setBusy(false); return; }
    setDone(true); setBusy(false);
    setTimeout(() => onDone?.(), 1500);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '0.5px solid var(--border)', borderRadius: 18, padding: '40px 36px', width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Cardo','Georgia',serif", marginBottom: 18 }}>
          {done ? 'Password Set!' : 'Set Your Password'}
        </div>
        {done ? (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>You're all set.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input className="input" type="password" placeholder="New password (8+ chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={{ marginBottom: 10 }} />
            <input className="input" type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ marginBottom: 14 }} />
            {err && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 12 }}>{err}</div>}
            <button type="submit" className="btn-gold" disabled={busy} style={{ width: '100%', padding: '11px' }}>
              {busy ? 'Saving…' : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ message }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div style={{ width: 34, height: 34, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'nsh-spin 0.8s linear infinite' }} />
      {message && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{message}</div>}
      <style>{`@keyframes nsh-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  if (publicScheduleId) return <PublicSchedule inquiryId={publicScheduleId} />;

  const [session, setSession]             = useState(undefined);
  const [needsPassword, setNeedsPassword] = useState(
    initialAuthType === 'invite' || initialAuthType === 'recovery'
  );
  const [view, setView]                   = useState('inquiries');
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session?.user?.user_metadata?.must_change_password) setNeedsPassword(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess ?? null);
      if (event === 'PASSWORD_RECOVERY') setNeedsPassword(true);
      if (event === 'SIGNED_IN' && sess?.user?.user_metadata?.must_change_password) setNeedsPassword(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setNeedsPassword(false);
    setView('inquiries');
  }

  if (session === undefined) return <Spinner />;
  if (needsPassword && session) return <SetPasswordScreen onDone={() => { setNeedsPassword(false); window.history.replaceState(null, '', window.location.pathname); }} />;
  if (!session) return <AuthScreen />;

  const pages = {
    inquiries: <Inquiries />,
    tours: <TourBookings />,
    venue: <VenueRentals />,
  };
  const activeItem = NAV_ITEMS.find(i => i.key === view) || NAV_ITEMS[0];

  return (
    <VenueContext.Provider value={{ session, signOut, setView }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'system-ui, sans-serif' }}>
        {!isMobile && <Sidebar view={view} setView={setView} />}

        {isMobile && mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, background: '#2a2a2e', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                <img src="assets/logo.png" alt="NSH" style={{ height: 32 }} />
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              <nav style={{ flex: 1, padding: '8px 8px' }}>
                {NAV_ITEMS.map(item => (
                  <button key={item.key} onClick={() => { setView(item.key); setMobileMenuOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 12px',
                    background: view === item.key ? 'rgba(181,161,133,0.15)' : 'transparent',
                    border: 'none', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                    color: view === item.key ? '#f0ebe3' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: view === item.key ? 600 : 400, marginBottom: 2,
                  }}>
                    <NavIcon id={item.key} active={view === item.key} />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div style={{ padding: '12px 8px 20px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500,
                }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ background: '#fdfcfb', padding: isMobile ? '12px 16px 10px' : '24px 32px 18px', borderBottom: '3px solid rgba(136,108,68,0.35)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
              {isMobile && (
                <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#888', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>
              )}
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(136,108,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <NavIcon id={activeItem.key} active={true} />
              </div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 700, color: 'var(--gold)', fontFamily: "'Cardo', serif", textShadow: '1px 2px 0px rgba(136,108,68,0.2)' }}>{activeItem.label}</h1>
            </div>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '16px 14px' : '28px 32px' }}>
            <div style={{ maxWidth: 900 }}>
              {pages[view] ?? pages.inquiries}
            </div>
          </div>
        </div>
      </div>
    </VenueContext.Provider>
  );
}
