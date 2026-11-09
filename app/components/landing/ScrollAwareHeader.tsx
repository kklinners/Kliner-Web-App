"use client";

import { useEffect, useRef } from "react";

// The menu scrolls away with the page. This only flags when the page has moved,
// so the pinned logo tab inside can shrink.
export default function ScrollAwareHeader({ children }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      if (ref.current) ref.current.dataset.scrolled = String(window.scrollY > 40);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header ref={ref} className="group relative z-30">
      {children}
    </header>
  );
}
