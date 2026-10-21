// Stroke icons (decorative — callers supply accessible labels on their controls).
const Svg = ({ children, ...p }) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>{children}</svg>;

export const IconSearch = () => <Svg><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const IconHeart = () => <Svg><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.5 3 5 6.4 5c2 0 3.3 1.1 4.1 2.3h3C14.3 6.1 15.6 5 17.6 5 21 5 22.7 8.5 21.2 11.4 19 15.6 12 20 12 20Z" /></Svg>;
export const IconBag = () => <Svg><path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></Svg>;
export const IconMenu = () => <Svg><path d="M4 8h16M4 16h16" /></Svg>;
export const IconClose = () => <Svg><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const IconLeft = () => <Svg><path d="m15 6-6 6 6 6" /></Svg>;
export const IconRight = () => <Svg><path d="m9 6 6 6-6 6" /></Svg>;
export const IconDown = () => <Svg><path d="m6 9 6 6 6-6" /></Svg>;
export const IconRotL = () => <Svg><path d="M4 12a8 8 0 1 0 2.3-5.6" /><path d="M4 4v4h4" /></Svg>;
export const IconRotR = () => <Svg><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4h-4" /></Svg>;
export const IconPin = () => <Svg><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>;
export const IconPhone = () => <Svg><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10.5 5.5h3" /></Svg>;
export const IconClock = () => <Svg><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></Svg>;
export const IconCall = () => <Svg><path d="M6 4h3l1.5 4-2 1.2a10 10 0 0 0 6.3 6.3l1.2-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2Z" /></Svg>;
export const IconNav = () => <Svg><path d="m4 11 16-7-7 16-2-7-7-2Z" /></Svg>;
export const IconStore = () => <Svg><path d="M4 9 5.5 4h13L20 9" /><path d="M4 9h16v2a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 11Z" /><path d="M5 13v7h14v-7" /></Svg>;
export const IconGrid = () => <Svg><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></Svg>;
export const IconCheck = () => <Svg><path d="m5 12 4 4 10-10" /></Svg>;
export const IconPlus = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>;
export const IconMinus = () => <Svg><path d="M5 12h14" /></Svg>;
export const IconTrash = () => <Svg><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;
export const IconBox = () => <Svg><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></Svg>;
export const IconAlert = () => <Svg><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4M12 17h.01" /></Svg>;
export const IconInstagram = () => <Svg><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" className="fill" /></Svg>;
export const IconTikTok = () => <Svg><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.8 2.4 4.5 5 4.7" /></Svg>;
export const IconChat = () => <Svg><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /></Svg>;
