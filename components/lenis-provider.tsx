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
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node: Element) =>
        node.closest('[data-sidebar="content"]') !== null ||
        node.closest('[data-lenis-prevent]') !== null,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    // Keep a stable reference to the ticker callback so it can be removed correctly
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const id = setTimeout(() => {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}