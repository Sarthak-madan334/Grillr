import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConversationTurnBanner } from "../../components/ConversationTurnBanner";

describe("ConversationTurnBanner", () => {
  it.each([
    ["asking", "AI is asking"],
    ["listening", "Your turn"],
    ["processing", "Reviewing your answer"],
    ["completed", "Interview complete"],
  ] as const)("renders the %s conversation state", (state, label) => {
    render(<ConversationTurnBanner state={state} />);
    expect(screen.getByRole("status", { name: `Conversation state: ${label}` })).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
