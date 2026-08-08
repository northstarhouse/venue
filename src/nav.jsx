export const NAV_ITEMS = [
  {
    key: 'inquiries',
    label: 'Inquiries',
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  },
  {
    key: 'tours',
    label: 'Tour Bookings',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  },
  {
    key: 'venue',
    label: 'After Event Flow',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><path d="M9 2v4"/><path d="M15 2v4"/>',
  },
];

export function NavIcon({ id, active }) {
  const item = NAV_ITEMS.find((i) => i.key === id);
  if (!item) return null;
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}
      dangerouslySetInnerHTML={{ __html: item.icon }} />
  );
}
