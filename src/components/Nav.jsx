const ITEMS = [
  { key: 'venue', label: 'Venue Rentals' },
];

export default function Nav({ view, setView }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
      borderTop: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-around',
      padding: '8px 0', zIndex: 10,
    }}>
      {ITEMS.map(item => (
        <button
          key={item.key}
          onClick={() => setView(item.key)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: view === item.key ? 'var(--gold)' : 'var(--muted)',
            fontSize: 12, fontWeight: view === item.key ? 600 : 500,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
