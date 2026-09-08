import { describe, expect, it } from "vitest";
import { isOAuthProvider, safeNextPath } from "../../lib/oauth";

describe("OAuth helpers", () => {
  it("accepts only configured providers", () => {
    expect(isOAuthProvider("google")).toBe(true);
    expect(isOAuthProvider("github")).toBe(true);
    expect(isOAuthProvider("facebook")).toBe(false);
  });

  it("allows safe internal redirects only", () => {
    expect(safeNextPath("/history")).toBe("/history");
    expect(safeNextPath("https://example.com")).toBe("/dashboard");
    expect(safeNextPath("//example.com")).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
  });
});
