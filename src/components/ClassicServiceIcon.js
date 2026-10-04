const paths = {
  'mezuzah-installation': <><rect x="9" y="3" width="7" height="26" rx="2" /><path d="M11.5 8h2M11.5 13h2M11.5 23h2" /></>,
  'tefillin-checking-and-sales': <><path d="m7 5 6 6-5 5-6-6zM21 3l7 7-6 6-7-7zM10 18l-5 5 4 4 10-10M22 17l-9 12" /></>,
  'hachanah-lebar-mitzvah': <><path d="M5 9c5-2 8-1 11 1 3-2 6-3 11-1v18c-5-2-8-1-11 1-3-2-6-3-11-1zM16 10v18M9 14l3 1M9 19l3 1M20 15l3-1M20 20l3-1" /></>,
  'family-purity': <><circle cx="11" cy="9" r="4" /><circle cx="23" cy="11" r="3" /><path d="M3 28v-4a8 8 0 0 1 16 0v4M22 19a6 6 0 0 1 7 6v3" /></>,
  'chuppah-services': <><circle cx="16" cy="20" r="8" /><path d="m12 5 4-3 4 3-4 6zM12 5h8M16 11v1" /></>,
  'business-services': <><rect x="3" y="10" width="26" height="18" rx="2" /><path d="M11 10V5h10v5M3 17h26M13 16v4h6v-4" /></>,
};

export default function ClassicServiceIcon({ slug }) {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[slug] || <path d="M16 3c2 8 5 11 13 13-8 2-11 5-13 13C14 21 11 18 3 16 11 14 14 11 16 3Z" />}</svg>;
}
