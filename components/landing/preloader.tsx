"use client"

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

// ─── constants ────────────────────────────────────────────────────────────────
const RING_R = 44
const CIRCUMFERENCE = 2 * Math.PI * RING_R

const STATUSES = [
  'Initializing workspace',
  'Loading knowledge base',
  'Syncing notes & projects',
  'Organizing resources',
  'Applying your preferences',
  'Welcome to Volt',
] as const

// ─── component ────────────────────────────────────────────────────────────────
interface PreloaderProps {
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Respect system preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }

    const root = containerRef.current!
    const get = <T extends Element>(sel: string) => root.querySelector<T>(sel)

    // ── ambient ring rotations (run the whole loading phase) ──────────────────
    const outerSpin = gsap.to('.ring-outer', {
      rotation: 360,
      duration: 14,
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%',
    })

    const innerSpin = gsap.to('.ring-inner', {
      rotation: -360,
      duration: 8,
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%',
    })

    // Subtle breathing on the V mark
    gsap.to('.logo-mark', {
      opacity: 0.55,
      duration: 1.9,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    // ── master timeline ────────────────────────────────────────────────────────
    const tl = gsap.timeline({
      onComplete: () => onComplete(),
      defaults: { ease: 'power2.out' },
    })

    // Entrance — stagger HUD + center in
    // fromTo() is used (not from()) so GSAP explicitly owns both states —
    // the elements start opacity-0 in JSX to prevent FOUC on first paint.
    tl.fromTo('.hud-corner',
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 },
    )
    tl.fromTo(
      '.center-assembly',
      { opacity: 0, scale: 0.88 },
      { opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
      '-=0.35',
    )
    tl.fromTo('.status-row',
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.4 },
      '-=0.25',
    )

    // ── progress 0 → 100 ──────────────────────────────────────────────────────
    const progressObj = { value: 0 }

    tl.to(
      progressObj,
      {
        value: 100,
        duration: 2.8,
        ease: 'power2.inOut',
        onUpdate() {
          const val = Math.floor(progressObj.value)

          // SVG arc
          const arc = get<SVGCircleElement>('.progress-arc')
          if (arc) arc.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - val / 100))

          // Percentage label
          const pct = get<HTMLElement>('.progress-pct')
          if (pct) pct.innerText = `${val}%`

          // Status copy — update only on boundary cross
          const statusEl = get<HTMLElement>('.status-text')
          const idx = Math.min(Math.floor(val / 20), STATUSES.length - 2)
          if (statusEl && statusEl.innerText !== STATUSES[idx]) {
            statusEl.innerText = STATUSES[idx]
          }
        },
      },
      '+=0.1',
    )

    // ── lock-complete ─────────────────────────────────────────────────────────
    tl.add(() => {
      outerSpin.pause()
      innerSpin.pause()

      const statusEl = get<HTMLElement>('.status-text')
      if (statusEl) statusEl.innerText = STATUSES[5]
    })

    // Micro-snap on rings (physical "click" of the lock)
    tl.to(
      ['.ring-outer', '.ring-inner'],
      {
        rotation: (i: number) => (i === 0 ? '+=10' : '-=10'),
        duration: 0.22,
        ease: 'power4.out',
        transformOrigin: '50% 50%',
      },
    )

    // Radial glow pulse
    tl.to('.center-glow', { opacity: 1, scale: 1.12, duration: 0.35, ease: 'power2.out', transformOrigin: '50% 50%' })
    tl.to('.center-glow', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.15')

    // Brief "complete" state — arc flashes white
    tl.to('.progress-arc', { strokeOpacity: 0, duration: 0.35, ease: 'power2.in' }, '-=0.3')

    // ── unified exit ──────────────────────────────────────────────────────────
    // 1. Content collapses inward (overlay layers)
    tl.to(
      ['.overlay-content', '.hud-corner'],
      { opacity: 0, scale: 0.96, duration: 0.38, ease: 'power2.inOut' },
    )

    // 2. Panels slide apart — they carry the "door halves" of the circle
    tl.to('.panel-left', { xPercent: -100, duration: 1.05, ease: 'power4.inOut' }, '-=0.08')
    tl.to('.panel-right', { xPercent: 100, duration: 1.05, ease: 'power4.inOut' }, '<')

    // 3. Dissolve the container so the dashboard is fully revealed
    tl.to(root, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.25')

  }, { scope: containerRef, dependencies: [] })

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden select-none text-white"
      aria-label="Loading Volt"
      role="status"
    >
      {/* ── split panels (provide the solid backdrop) ───────────────────────── */}
      <div className="panel-left  absolute inset-y-0 left-0  w-1/2 bg-[#060608]" />
      <div className="panel-right absolute inset-y-0 right-0 w-1/2 bg-[#060608]" />

      {/* ── subtle dot-grid texture ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* ── HUD corners ─────────────────────────────────────────────────────── */}
      <div className="hud-corner absolute top-5 left-5 font-mono leading-snug" style={{ opacity: 0 }}>
        <p className="text-[0.58rem] tracking-[0.35em] text-white/60 font-semibold">VOLT OS</p>
        <p className="text-[0.54rem] tracking-[0.25em] text-white/25 mt-0.5">v2.0</p>
      </div>

      <div className="hud-corner absolute top-5 right-5 font-mono text-right leading-snug" style={{ opacity: 0 }}>
        <p className="text-[0.54rem] tracking-[0.25em] text-white/25">STATUS</p>
        <p className="text-[0.58rem] tracking-[0.3em] text-white/55 mt-0.5 animate-pulse">ONLINE</p>
      </div>

      <div className="hud-corner absolute bottom-5 left-5 font-mono leading-snug" style={{ opacity: 0 }}>
        <p className="text-[0.54rem] tracking-[0.25em] text-white/25">ENCRYPTION</p>
        <p className="text-[0.58rem] tracking-[0.3em] text-white/50 mt-0.5">AES-256</p>
      </div>

      <div className="hud-corner absolute bottom-5 right-5 font-mono text-right leading-snug" style={{ opacity: 0 }}>
        <p className="text-[0.54rem] tracking-[0.25em] text-white/25">PERSONAL</p>
        <p className="text-[0.58rem] tracking-[0.3em] text-white/50 mt-0.5">KNOWLEDGE BASE</p>
      </div>

      {/* ── centre content ──────────────────────────────────────────────────── */}
      <div className="overlay-content absolute inset-0 flex flex-col items-center justify-center gap-7 pointer-events-none">

        {/* Central assembly */}
        <div className="center-assembly relative w-[196px] h-[196px] flex items-center justify-center" style={{ opacity: 0 }}>

          {/* Completion glow (invisible until lock-complete) */}
          <div
            className="center-glow absolute w-[130px] h-[130px] rounded-full opacity-0"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 72%)' }}
          />

          {/* SVG ring assembly */}
          <svg
            viewBox="0 0 100 100"
            className="absolute w-full h-full"
            aria-hidden="true"
          >
            {/* Outer dashed decoration — rotates clockwise */}
            <circle
              className="ring-outer"
              cx="50" cy="50" r="47"
              fill="none"
              stroke="rgba(255,255,255,0.065)"
              strokeWidth="0.55"
              strokeDasharray="1.8 5.5"
              style={{ transformOrigin: '50% 50%' }}
            />

            {/* Progress track (static, very subtle) */}
            <circle
              cx="50" cy="50" r={RING_R}
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1.1"
            />

            {/* Progress arc — animated via strokeDashoffset */}
            <circle
              className="progress-arc"
              cx="50" cy="50" r={RING_R}
              fill="none"
              stroke="rgba(255,255,255,0.88)"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />

            {/* Inner dashed decoration — counter-rotates */}
            <circle
              className="ring-inner"
              cx="50" cy="50" r="35"
              fill="none"
              stroke="rgba(255,255,255,0.045)"
              strokeWidth="0.55"
              strokeDasharray="1 3.5"
              style={{ transformOrigin: '50% 50%' }}
            />

            {/* Centre fill — masks inner rings, creates the "disc" */}
            <circle cx="50" cy="50" r="28.5" fill="#060608" />

            {/* Four cardinal tick marks (subtle alignment cues) */}
            {([0, 90, 180, 270] as const).map((deg) => {
              const rad = (deg * Math.PI) / 180
              const x1 = 50 + 40 * Math.sin(rad)
              const y1 = 50 - 40 * Math.cos(rad)
              const x2 = 50 + 43 * Math.sin(rad)
              const y2 = 50 - 43 * Math.cos(rad)
              return (
                <line
                  key={deg}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {/* V monogram */}
          <div className="logo-mark relative z-10">
            <svg viewBox="0 0 38 38" width="38" height="38" aria-label="Volt">
              {/* Left arm */}
              <line
                x1="5" y1="10"
                x2="19" y2="29"
                stroke="white" strokeWidth="2.1" strokeLinecap="round"
              />
              {/* Right arm */}
              <line
                x1="33" y1="10"
                x2="19" y2="29"
                stroke="white" strokeWidth="2.1" strokeLinecap="round"
              />
              {/* Accent dot */}
              <circle cx="19" cy="29" r="1.3" fill="white" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Status + percentage */}
        <div className="status-row flex flex-col items-center gap-2" style={{ opacity: 0 }}>
          <p className="status-text font-mono text-[0.62rem] tracking-[0.22em] text-white/42 uppercase text-center min-w-[220px]">
            {STATUSES[0]}
          </p>
          <p className="progress-pct font-mono text-[0.54rem] tracking-[0.2em] text-white/22">
            0%
          </p>
        </div>
      </div>
    </div>
  )
}