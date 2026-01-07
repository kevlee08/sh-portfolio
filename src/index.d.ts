declare global {
  interface Window { openLightbox: (event: Event, set: number, initialIndex: number) => void; }
}
