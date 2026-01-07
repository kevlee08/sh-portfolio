import { useEffect, useRef, useState } from "react";
import Background from "./Background";
import { getBackgroundImages, getScrollPositions } from "./ScrollManager.helpers";
import ThreeDee from "./ThreeDee";

import './ScrollManager.css';

const ScrollManager = () => {
  const [activeBackground, setActiveBackground] = useState<number>(-1);
  const backgroundSrcs = getBackgroundImages();
  const threeDeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function scrollCheck() {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollPositions = getScrollPositions();
      const viewportHeight = window.outerHeight;
      const scrollHeight = document.body.scrollHeight - viewportHeight;
      const zoneTop = viewportHeight * .375;
      const zoneBottom = viewportHeight * .625;

      const viewportHeightWithTrap = viewportHeight - 200;

      // control ThreeDee visibility
      let threeDeeStyles: string = '';

      // positive means it reveals from the top, negative reveals from the bottom, 0 means disabled
      const mask = (scrollY < viewportHeight) ? viewportHeight - scrollY : (scrollY > scrollHeight) ? scrollHeight - scrollY : 0;

      if (mask !== 0) {
        threeDeeStyles =
          `clip-path: inset(${mask > 0 ? 0 : viewportHeightWithTrap + mask}px 0px ${mask < 0 ? 0 : viewportHeightWithTrap - mask}px 0px);`;
      } else {
        threeDeeStyles = "display: none ";
      }
      threeDeeRef.current!.style = threeDeeStyles

      // control Background 
      if (scrollY < 300) {
        setActiveBackground(-1);
        return;
      } else if (scrollPositions[0].top > viewportHeight / 2) {
        setActiveBackground(0)
        return;
      } else if (scrollPositions[scrollPositions.length - 1].bottom < zoneTop) {
        setActiveBackground(scrollPositions.length - 1);
        return;
      }

      const inZone = scrollPositions.findIndex((bounds) =>
        (bounds.top > zoneTop && bounds.top < zoneBottom) ||
        (bounds.bottom > zoneTop && bounds.bottom < zoneBottom) ||
        (bounds.top < zoneTop && bounds.bottom > zoneBottom)
      );
      console.log(inZone);
      if (inZone !== activeBackground) {
        setActiveBackground(inZone);
      };
    }

    scrollCheck();
    addEventListener('scroll', scrollCheck);
    addEventListener('resize', scrollCheck);
    return () => {
      removeEventListener('scroll', scrollCheck);
      removeEventListener('resize', scrollCheck);
    }
  }, []);

  return (
    <div className="ScrollManager">
      <Background
        srcs={backgroundSrcs}
        active={activeBackground}
      />
      <div className="ScrollManager__threedee" ref={threeDeeRef}>
        <ThreeDee />
      </div>
    </div>
  );
};

export default ScrollManager;   
