import { RefObject, useEffect, useState } from 'react';

/**
 * Tracks whether an element is near / inside the viewport.
 *  - `mounted` flips to true the first time the element comes within `mountMargin`
 *    of the viewport and stays true (lazy mount of the WebGL canvas).
 *  - `inView` follows actual visibility so the render loop can pause off-screen.
 */
export function useInView(ref: RefObject<Element>, mountMargin = '400px 0px') {
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      setInView(true);
      return;
    }
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: mountMargin },
    );
    const visible = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, [ref, mountMargin]);

  return { mounted, inView };
}
