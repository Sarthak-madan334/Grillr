import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PracticeStars } from "../../components/landing/PracticeStars";

let frames: Map<number, FrameRequestCallback>;
let context: { clearRect: ReturnType<typeof vi.fn>; setTransform: ReturnType<typeof vi.fn>; beginPath: ReturnType<typeof vi.fn>; arc: ReturnType<typeof vi.fn>; fill: ReturnType<typeof vi.fn>; fillStyle: string };
let reduced: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };
let fine: typeof reduced;
let intersect: IntersectionObserverCallback;
let disconnect: ReturnType<typeof vi.fn>;
let clock = 0;

function tick() {
  clock += 16.67;
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach(callback => callback(clock));
}
function move(section: HTMLElement, pointerType = "mouse") {
  fireEvent(section, Object.assign(new Event("pointermove"), { clientX: 570, clientY: 420, pointerType }));
}

beforeEach(() => {
  frames = new Map();
  clock = 0;
  let id = 0;
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frames.set(++id, callback); return id; }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((frame: number) => frames.delete(frame)));
  reduced = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  fine = { ...reduced, matches: true };
  vi.stubGlobal("matchMedia", vi.fn((query: string) => query.includes("reduced-motion") ? reduced : fine));
  context = { clearRect: vi.fn(), setTransform: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillStyle: "" };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ x: 50, y: 100, left: 50, top: 100, right: 1050, bottom: 700, width: 1000, height: 600, toJSON: () => ({}) });
  disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect = disconnect; });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe() {}
    disconnect = disconnect;
  });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("renders an open, accessible practice CTA with a decorative canvas and the existing destination", () => {
  render(<PracticeStars />);
  expect(screen.getByRole("heading", { name: "Start practicing today." })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Practice with Grillr" })).toHaveAttribute("href", "/interview/setup");
  const section = screen.getByRole("region", { name: "Start practicing today." });
  expect(section.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
  expect(section.querySelector("img")).toHaveClass("practice-stars-mountain");
  expect(section.querySelector("img")).toHaveAttribute("src", expect.stringContaining("mountain-starless"));
  expect(section).not.toHaveClass("home-cta-banner");
});

it("keeps stars still at rest, scatters them away from the pointer, and can pause and resume", () => {
  render(<PracticeStars />);
  const section = screen.getByRole("region");
  tick();
  const resting = context.arc.mock.calls.map((call) => call.slice(0, 2));
  expect(resting.length).toBeGreaterThan(1000);
  expect(frames.size).toBe(0);
  context.arc.mockClear();
  move(section);
  tick();
  const scattered = context.arc.mock.calls.map((call) => call.slice(0, 2));
  expect(scattered).toHaveLength(resting.length);
  expect(resting.some(([x, y], index) => scattered[index]?.[0] !== x || scattered[index]?.[1] !== y)).toBe(true);
  expect(frames.size).toBe(1);
  fireEvent.click(screen.getByRole("button", { name: "Pause star response" }));
  tick();
  expect(frames.size).toBe(0);
  const draws = context.clearRect.mock.calls.length;
  move(section);
  expect(context.clearRect).toHaveBeenCalledTimes(draws);
  fireEvent.click(screen.getByRole("button", { name: "Resume star response" }));
  tick();
  expect(frames.size).toBe(0);
});

it("keeps the stars static for reduced motion and touch input", () => {
  reduced.matches = true;
  render(<PracticeStars />);
  const section = screen.getByRole("region");
  tick();
  move(section);
  tick();
  expect(frames.size).toBe(0);
  reduced.matches = false;
  fine.matches = false;
  move(section, "touch");
  expect(frames.size).toBe(0);
});

it("settles scattered stars back to their resting positions when the pointer leaves", () => {
  render(<PracticeStars />);
  tick();
  const resting = context.arc.mock.calls.map((call) => call.slice(0, 3));
  move(screen.getByRole("region"));
  tick();
  const scattered = context.arc.mock.calls.length;
  context.arc.mockClear();
  fireEvent(screen.getByRole("region"), new Event("pointerleave"));
  for (let attempt = 0; attempt < 24 && frames.size; attempt += 1) {
    context.arc.mockClear();
    tick();
  }
  expect(scattered).toBe(resting.length);
  expect(context.arc.mock.calls.map((call) => call.slice(0, 2))).toEqual(resting.map((call) => call.slice(0, 2)));
  expect(frames.size).toBe(0);
});

it("stops offscreen work and releases frames, observers, and listeners on unmount", () => {
  const { unmount } = render(<PracticeStars />);
  tick();
  move(screen.getByRole("region"));
  tick();
  expect(frames.size).toBe(1);
  intersect([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
  expect(frames.size).toBe(0);
  unmount();
  expect(disconnect).toHaveBeenCalledTimes(2);
  expect(reduced.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
});

it("leaves the CTA usable with a static fallback if canvas is unavailable", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<PracticeStars />);
  expect(screen.getByRole("link", { name: "Practice with Grillr" })).toBeInTheDocument();
  expect(screen.getByRole("region")).not.toHaveAttribute("data-stars-ready");
  expect(frames.size).toBe(0);
});
