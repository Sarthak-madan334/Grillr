import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JobTitleAutocomplete } from "../../components/interview/JobTitleAutocomplete";

describe("JobTitleAutocomplete", () => {
  it("filters suggestions and highlights the matching text", () => {
    render(<JobTitleAutocomplete value="soft" onChange={vi.fn()} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    expect(screen.getAllByRole("option", { name: /software engineer/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Soft", { exact: true }).length).toBeGreaterThan(0);
  });

  it("selects with keyboard navigation and preserves arbitrary free text", () => {
    function ControlledAutocomplete() {
      const [value, setValue] = useState("front");
      return <JobTitleAutocomplete value={value} onChange={setValue} />;
    }

    render(<ControlledAutocomplete />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Frontend Engineer");

    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.change(input, { target: { value: "My Very Specific Engineering Role" } });
    expect(input).toHaveValue("My Very Specific Engineering Role");
  });

  it("closes with Escape without changing the input", () => {
    const onChange = vi.fn();
    render(<JobTitleAutocomplete value="data" onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});