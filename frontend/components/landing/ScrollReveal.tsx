"use client";

import { useEffect } from "react";

/** Progressive enhancement: content stays visible without JavaScript. */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => { element.classList.add("reveal-pending"); observer.observe(element); });
    return () => { observer.disconnect(); elements.forEach((element) => element.classList.remove("reveal-pending")); };
  }, []);
  return null;
}
