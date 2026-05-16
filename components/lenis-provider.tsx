"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only initialize ScrollTrigger and Lenis integration on the client
    gsap.registerPlugin(ScrollTrigger);

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

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      lenisRef.current = null;
    };
  }, []);

  // On every route change, scroll to top and resize so Lenis recalculates
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    // Small timeout lets the new page's DOM settle before resizing
    const id = setTimeout(() => {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
