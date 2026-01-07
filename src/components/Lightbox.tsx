import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useWindowSize } from "./helpers";

import './Lightbox.css';

const Lightbox: FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const [allowTransitions, setAllowTransitions] = useState<boolean>(false);
  const [currentSet, setCurrentSet] = useState<{ src: string, alt: string }[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  useWindowSize();

  const imagestripRef = useRef<HTMLDivElement>(null);
  const activeImageElement =
    !loading ? imagestripRef.current?.querySelectorAll('img')[currentIndex] : undefined;

  const openLightbox = useCallback((event: PointerEvent, initialIndex: number) => {
    const slidesEl = event.target?.closest('.slides');
    const images = slidesEl.querySelectorAll('.slides-thumbnail img');
    const set = Array.from(images).map((img: Element) => ({
      src: img.src,
      alt: img.alt
    }));

    if (!slidesEl || !set) { return };


    // debugger;
    setShow(true)
    setAllowTransitions(true);
    setCurrentSet(set);
    setCurrentIndex(initialIndex);
    setLoading(true);
    event.preventDefault();
  }, [currentSet]);

  const gotoNext = () => {
    if (currentSet == null) {
      return;
    }
    const nextIndex = (currentIndex + 1) % currentSet.length;
    setAllowTransitions(true);
    setCurrentIndex(nextIndex);
  };
  const gotoPrev = () => {
    if (currentSet == null) {
      return;
    }
    const prevIndex = (currentIndex - 1 + currentSet.length) % currentSet.length;
    setAllowTransitions(true);
    setCurrentIndex(prevIndex);
  };
  const closeLightbox = () => {
    if (show) {
      setShow(false);
      setAllowTransitions(true);
    }
  }
  const resetLightbox = () => {
    setAllowTransitions(false);
    if (!show) {
      setCurrentSet(null);
      setCurrentIndex(0);
      setLoading(false);
    }
  }
  const checkImageLoad = () => {
    if (currentSet == null) {
      return;
    }
    const images = imagestripRef.current?.getElementsByTagName('img');
    if (!images) {
      return;
    }
    let allLoaded = true;
    for (let i = 0; i < images.length; i++) {
      if (!images[i].complete) {
        allLoaded = false;
        break;
      }
    }
    if (allLoaded) {
      setLoading(false);
      setTimeout(() => setLoading(false), 1000);

    }
  };

  useEffect(() => {
    window.openLightbox = openLightbox;


  }, []);

  return <div
    className={'Lightbox' + (show ? ' Lightbox--active' : '') + (allowTransitions ? ' Lightbox--allow-transitions' : '')}
    onTransitionEnd={() => resetLightbox()}
  >
    <div className="Lightbox__background" onClick={() => closeLightbox()}></div>
    <div className="Lightbox__interior">
      <div
        className={"Lightbox__carousel" + (loading ? ' Lightbox__carousel--loading' : '')}
        style={activeImageElement ? { width: activeImageElement.width, height: activeImageElement.height } : {}}>
        <div
          className={'Lightbox__imagestrip'}
          ref={imagestripRef}
          style={{ transform: `translateY(-50%)` + (activeImageElement ? `translateX(${-activeImageElement?.offsetLeft}px)` : '') }}
        >
          {show && currentSet != null && currentSet.map((image, index) => {
            return <div key={index}>
              <img
                src={image.src}
                alt={`Lightbox image ${index + 1}`}
                onLoad={() => checkImageLoad()}
              />
            </div>
          }
          )}
        </div>
      </div>
      <div className="Lightbox__controls">
        <div className="Lightbox__caption">{currentSet && currentSet[currentIndex]?.alt}</div>
        <div className="Lightbox__navigation">
          <button onClick={() => gotoPrev()}>&larr;</button>
          <button onClick={() => gotoNext()}>&rarr;</button>
        </div>
      </div>
    </div>
    <button className="Lightbox__close-button">
      <img src='/images/close.svg' alt='Lightbox background' onClick={() => closeLightbox()} />
    </button>
  </div >;
};

export default Lightbox;  
