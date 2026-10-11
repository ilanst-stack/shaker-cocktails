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
