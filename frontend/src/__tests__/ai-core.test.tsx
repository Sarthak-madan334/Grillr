import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AICoreWorkspace } from "../../components/AICoreWorkspace";

describe("AICoreWorkspace", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends a prompt and renders the streamed response", () => {
    vi.useFakeTimers();
    render(<AICoreWorkspace />);

    const composer = screen.getByRole("textbox", { name: "Message AI Core" });
    fireEvent.change(composer, { target: { value: "Make this answer more specific" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Make this answer more specific")).toBeInTheDocument();
    expect(screen.getByText("Generating")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText(/measurable result/)).toBeInTheDocument();
  });

  it("clears the conversation and exposes the empty state", () => {
    render(<AICoreWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    expect(screen.getByText("Start with a question")).toBeInTheDocument();
  });
});
