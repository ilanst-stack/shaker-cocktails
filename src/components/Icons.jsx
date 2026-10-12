const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconList = () => (<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" {...S}><path d="M4 7h16M4 12h16M4 17h10" /></svg>);
export const IconGlass = () => (<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" {...S}><path d="M4 4h16l-8 9z M12 13v7 M8 20h8" /></svg>);
export const IconStarLine = () => (<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" {...S}><path d="M12 3l2.7 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.5 6.5 19.6l1.2-6.1L3.2 9.3l6.1-.7z" /></svg>);
export const IconSpark = () => (<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" {...S}><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" /></svg>);
export const IconBack = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S} strokeWidth={2.8}><path d="M9 5l7 7-7 7" /></svg>);
export const IconCamera = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>);
export const IconGallery = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>);
export const IconTrash = () => (<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>);
export const IconPlus = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S} strokeWidth={3}><path d="M12 5v14M5 12h14" /></svg>);
export const IconSearch = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>);

const STAR = 'M12 2.5 L14.9 8.6 L21.5 9.3 L16.6 13.8 L18 20.4 L12 17 L6 20.4 L7.4 13.8 L2.5 9.3 L9.1 8.6 Z';
export function Star({ on, size = 32, fill = '#FFE14D' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
      <path d={STAR} fill={on ? fill : '#fff'} stroke="#111" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
export const IconCart = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M3 4h2l2.4 11h10.2L20 8H6.3" /><circle cx="9" cy="19.5" r="1.5" /><circle cx="17" cy="19.5" r="1.5" /></svg>);
export const IconSort = () => (<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4" /></svg>);
export const IconGrip = () => (<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7" /><circle cx="15" cy="6" r="1.7" /><circle cx="9" cy="12" r="1.7" /><circle cx="15" cy="12" r="1.7" /><circle cx="9" cy="18" r="1.7" /><circle cx="15" cy="18" r="1.7" /></svg>);
export const IconChevron = ({ dir = 'down' }) => (<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...S} strokeWidth={2.8} style={{ transform: { down: 'none', up: 'rotate(180deg)', left: 'rotate(90deg)', right: 'rotate(-90deg)' }[dir] }}><path d="M6 9l6 6 6-6" /></svg>);
export const IconAlert = () => (<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M12 3l10 18H2z M12 10v5 M12 18v.5" /></svg>);
export const IconShare = () => (<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></svg>);
export const IconCheck = () => (<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...S} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7" /></svg>);
