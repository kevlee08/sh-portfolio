export const getScrollPositions = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.feature')).map((el) => {
    const bounds = el.getBoundingClientRect();
    return bounds;
  });

export const getBackgroundImages = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.feature .feature-image')).map((el) =>
    el.attributes.getNamedItem('src')?.value
  ).filter(x => x != null);
