export { };

declare global {
  interface Window {
    openLightbox: (event: PointerEvent, initialIndex: number) => void;
  }
}
