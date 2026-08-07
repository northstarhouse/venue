import { useVenue } from '../App.jsx';
import { NAV_ITEMS, NavIcon } from '../nav.jsx';

export default function Sidebar({ view, setView }) {
  const { signOut } = useVenue();

  return (
    <div style={{ width: 220, background: '#2a2a2e', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 14px', display: 'flex', justifyContent: 'center' }}>
        <img src="assets/logo.png" alt="North Star House" style={{ width: 195, display: 'block' }} />
      </div>
      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', margin: '0 0 8px' }} />

      <nav style={{ flex: 1, padding: '0 8px' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px',
              background: view === item.key ? 'rgba(181,161,133,0.15)' : 'transparent',
              border: 'none', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
              color: view === item.key ? '#f0ebe3' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: view === item.key ? 600 : 400,
              marginBottom: 2, transition: 'all 0.15s',
            }}
          >
            <NavIcon id={item.key} active={view === item.key} />
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '12px 8px 16px', borderTop: '0.5px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
        <button onClick={signOut} style={{
          width: '100%', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
          background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500,
        }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
