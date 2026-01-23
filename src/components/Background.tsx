import { useEffect, useRef, useState } from 'react';

import './Background.css';

interface BackgroundProps {
  srcs: string[];
  active: number
}
const Background: React.FC<BackgroundProps> = ({ srcs, active }) => {
  const [stack, setStack] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollCheck = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollHeight = document.body.scrollHeight - window.outerHeight;
      const viewportHeight = window.outerHeight;
      let perc: number;
      if (scrollY < viewportHeight) {
        perc = 0;
      } else if (scrollY > scrollHeight) {
        perc = 1;
      } else {
        perc = (scrollY - viewportHeight) / (scrollHeight - viewportHeight);
      }
      if (ref.current) {
        const value = `translateY(${(-10 * perc).toString()}vh)`;
        ref.current.style.transform = value;
      }
    };
    window.addEventListener('scroll', scrollCheck);
    window.addEventListener('resize', scrollCheck);
    return () => {
      window.removeEventListener('scroll', scrollCheck);
      window.removeEventListener('resize', scrollCheck);
    };
  }, []);

  // adjust stack of backgrounds
  if (active === -1) {
    if (stack?.length) {
      setStack([]);
    }
  } else if (stack[0] !== active) {
    setStack(prev => {
      const newStack = [active, ...prev.filter((i) => i !== active)];
      return newStack;
    });
  }

  return (
    <div className="Background__container" ref={ref}> {
      active !== -1 && stack.map((bgIndex, i) => {
        if (i === 0) {
          return <div key={bgIndex} className="Background" style={{ backgroundImage: `url(${srcs[bgIndex]})` }} />;
        } else {
          return <div key={bgIndex} className="Background Background--fade-out" style={{ backgroundImage: `url(${srcs[bgIndex]})` }} onAnimationEnd={() => {
            setStack(prev => prev.filter((i) => bgIndex !== i));
          }} />;
        }
      })
    }</div>);
};
export default Background;
