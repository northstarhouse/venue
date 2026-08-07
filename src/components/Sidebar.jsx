import { useVenue } from '../App.jsx';

const ITEMS = [
  { key: 'venue', label: 'Venue Rentals' },
];

export default function Sidebar({ view, setView }) {
  const { signOut } = useVenue();

  return (
    <div style={{ width: 220, borderRight: '0.5px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Cardo','Georgia',serif", marginBottom: 4 }}>North Star House</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 28 }}>Venue</div>

      <div style={{ flex: 1 }}>
        {ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: view === item.key ? 'var(--light)' : 'transparent',
              color: view === item.key ? 'var(--gold)' : 'var(--text)',
              border: 'none', borderRadius: 8, padding: '9px 12px', marginBottom: 4,
              fontSize: 13, fontWeight: view === item.key ? 600 : 500, cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button onClick={signOut} className="btn-ghost" style={{ width: '100%' }}>Sign Out</button>
    </div>
  );
}
