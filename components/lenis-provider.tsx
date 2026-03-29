"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Prevent Lenis from intercepting scroll events inside sidebars
      // and any element explicitly marked to prevent lenis scrolling
      prevent: (node: Element) =>
        node.closest('[data-sidebar="content"]') !== null ||
        node.closest('[data-lenis-prevent]') !== null,
    });

    lenisRef.current = lenis;

    let raf: number;

    function raf_loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(raf_loop);
    }

    raf = requestAnimationFrame(raf_loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // On every route change, scroll to top and resize so Lenis recalculates
  // document dimensions (the dashboard layout and root layout have very
  // different scroll heights, which confuses Lenis on client-side navigation)
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    // Small timeout lets the new page's DOM settle before resizing
    const id = setTimeout(() => {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
    }, 50);

    return () => clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
