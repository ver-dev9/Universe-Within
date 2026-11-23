import { RefObject, useEffect, useState } from 'react';

/**
 * True while the element is on screen or within `margin` of it. Chapter canvases
 * mount only while this is true, so their WebGL contexts (and GPU memory) exist
 * only near the viewport. Shared by Chapter 08 and Chapter 09.
 */
export function useNearViewport(ref: RefObject<Element>, margin = '25%'): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: `${margin} 0px ${margin} 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}
