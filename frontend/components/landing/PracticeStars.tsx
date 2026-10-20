"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "./ArrowIcon";

type Star = { x: number; y: number; radius: number; alpha: number; depth: number; phase: number; twinkleSpeed: number; offsetX: number; offsetY: number };

export function PracticeStars() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionControlRef = useRef<(paused: boolean) => void>(() => undefined);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!section || !canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let motionPaused = false;
    let visible = true;
    let stars: Star[] = [];
    const pointer = { x: 0, y: 0, active: false };

    function draw(time = 0) {
      frame = 0;
      const step = previousTime ? Math.min((time - previousTime) / 16.67, 2) : 1;
      previousTime = time;
      const smoothing = 1 - Math.pow(0.9, step);
      const moving = !motionPaused && !reducedMotion.matches && finePointer.matches;
      const interactive = pointer.active && moving;
      if (moving) elapsed += step * 16.67;
      context!.clearRect(0, 0, width, height);
      for (const star of stars) {
        // Slow shared sky drift; pointer parallax varies with depth.
        const baseX = ((star.x + elapsed * 0.00000015) % 1) * width;
        const baseY = star.y * height;
        const dx = baseX - pointer.x;
        const dy = baseY - pointer.y;
        const distance = Math.hypot(dx, dy);
        const proximity = interactive ? Math.max(0, 1 - distance / 200) : 0;
        const force = proximity ** 2 * 18 * star.depth;
        const targetX = interactive ? (pointer.x / width - 0.5) * 22 * star.depth + dx / Math.max(distance, 1) * force : 0;
        const targetY = interactive ? (pointer.y / height - 0.5) * 12 * star.depth + dy / Math.max(distance, 1) * force : 0;
        if (moving) {
          star.offsetX += (targetX - star.offsetX) * smoothing;
          star.offsetY += (targetY - star.offsetY) * smoothing;
        }
        const scintillation = 0.86 + 0.14 * Math.sin(elapsed * 0.001 * star.twinkleSpeed + star.phase);
        context!.beginPath();
        context!.fillStyle = `rgba(238,238,241,${Math.min(0.9, star.alpha * scintillation * (1 + proximity * 0.3))})`;
        context!.arc(baseX + star.offsetX, baseY + star.offsetY, star.radius, 0, Math.PI * 2);
        context!.fill();
      }
      if (moving && visible && !document.hidden) frame = requestAnimationFrame(draw);
      else previousTime = 0;
    }

    function schedule() {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function resize() {
      const bounds = section!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      let seed = 7413;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      stars = Array.from({ length: Math.min(1800, Math.max(300, Math.round(width * height / 430))) }, () => ({
        x: random(), y: random() * 0.56, radius: 0.35 + random() ** 3 * 1.25,
        alpha: 0.2 + random() * 0.6, depth: 0.2 + random() * 0.8,
        phase: random() * Math.PI * 2, twinkleSpeed: 0.35 + random() * 0.6, offsetX: 0, offsetY: 0,
      }));
      section!.dataset.starsReady = "true";
      schedule();
    }

    function move(event: PointerEvent) {
      if (event.pointerType === "touch" || motionPaused || reducedMotion.matches || !finePointer.matches) return;
      const bounds = section!.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
      schedule();
    }
    function reset() { pointer.active = false; schedule(); }
    motionControlRef.current = (nextPaused) => {
      motionPaused = nextPaused;
      pointer.active = false;
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      schedule();
    };
    function visibilityChange() {
      pointer.active = false;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
      else schedule();
    }

    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", reset);
    reducedMotion.addEventListener("change", reset);
    finePointer.addEventListener("change", reset);
    document.addEventListener("visibilitychange", visibilityChange);
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(section);
    if (!resizeObserver) window.addEventListener("resize", resize);
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else { cancelAnimationFrame(frame); frame = 0; previousTime = 0; pointer.active = false; }
    }) : null;
    observer?.observe(section);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      observer?.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", reset);
      reducedMotion.removeEventListener("change", reset);
      finePointer.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", visibilityChange);
      window.removeEventListener("resize", resize);
      delete section.dataset.starsReady;
      motionControlRef.current = () => undefined;
    };
  }, []);

  return (
    <section ref={sectionRef} className="practice-stars" aria-labelledby="start-title">
      <Image src="/images/mountain-starless.webp" alt="" fill sizes="100vw" unoptimized className="practice-stars-mountain" />
      <canvas ref={canvasRef} className="practice-stars-canvas" aria-hidden="true" />
      <div className="practice-stars-shade" aria-hidden="true" />
      <div className="practice-stars-copy home-container">
        <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
        <h2 id="start-title">Start practicing today.</h2>
        <p>A calmer mind. A clearer answer. A little more ready.</p>
        <Link href="/interview/setup" className="glass-button glass-button--primary">Practice with Grillr <ArrowIcon /></Link>
      </div>
      <button type="button" className="practice-stars-motion glass-button glass-button--ghost" aria-label={paused ? "Resume star animation" : "Pause star animation"} aria-pressed={paused} onClick={() => {
        const nextPaused = !paused;
        setPaused(nextPaused);
        motionControlRef.current(nextPaused);
      }}>{paused ? "Resume sky" : "Pause sky"}</button>
    </section>
  );
}
