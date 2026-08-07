import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, initialAuthType } from './supabase.js';
import Nav from './components/Nav.jsx';
import Sidebar from './components/Sidebar.jsx';
import VenueRentals from './pages/VenueRentals.jsx';

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
  const [session, setSession]             = useState(undefined);
  const [needsPassword, setNeedsPassword] = useState(
    initialAuthType === 'invite' || initialAuthType === 'recovery'
  );
  const [view, setView]                   = useState('venue');
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);

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
    setView('venue');
  }

  if (session === undefined) return <Spinner />;
  if (needsPassword && session) return <SetPasswordScreen onDone={() => { setNeedsPassword(false); window.history.replaceState(null, '', window.location.pathname); }} />;
  if (!session) return <AuthScreen />;

  const pages = {
    venue: <VenueRentals />,
  };

  return (
    <VenueContext.Provider value={{ session, signOut, setView }}>
      {isMobile ? (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 72 }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {pages[view] ?? pages.venue}
          </div>
          <Nav view={view} setView={setView} />
        </div>
      ) : (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
          <Sidebar view={view} setView={setView} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              {pages[view] ?? pages.venue}
            </div>
          </div>
        </div>
      )}
    </VenueContext.Provider>
  );
}
