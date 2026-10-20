import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../lib/auth-client";
import { TopNav } from "../../components/layout/top-nav";
import { HomeCTA } from "../../components/HomeCTA";

vi.unmock("../../lib/auth-client");
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const user = { id: "existing-user", email: "alex@example.test", name: "Alex Morgan" };
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
function Landing() { return <AuthProvider><TopNav /><HomeCTA /></AuthProvider>; }
function Account() {
  const auth = useAuth();
  return <><p>{auth.isLoading ? "Checking" : auth.isAuthenticated ? `Signed in: ${auth.user?.name ?? auth.user?.email}` : "Guest"}</p><button onClick={() => void auth.signIn("alex@example.test", "test-password")}>Login</button><button onClick={() => void auth.signOut()}>Logout</button></>;
}
afterEach(() => { vi.unstubAllGlobals(); });

describe("actual session response and landing actions", () => {
  it("recognizes the flat backend /me response and hides guest actions in desktop and mobile navigation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ ...user, username: "alex", username_complete: true }));
    vi.stubGlobal("fetch", fetchMock);
    render(<Landing />);
    expect(await screen.findByRole("link", { name: "Continue practicing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Your dashboard" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.queryByRole("link", { name: /sign in|get started|create your account/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({ credentials: "include" }));
  });

  it("also accepts wrapped session responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ user })));
    render(<Landing />);
    expect(await screen.findByRole("link", { name: "Your dashboard" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Create your account" })).not.toBeInTheDocument();
  });

  it("shows guest actions when the server rejects the session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ detail: { message: "Authentication is required" } }, 401)));
    render(<Landing />);
    expect(await screen.findByRole("link", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("does not treat malformed successful payloads as authenticated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ name: "not a user" })));
    render(<Landing />);
    expect(await screen.findByRole("link", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  it("normalizes missing names and preserves wrapped login and logout behavior", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(response({ detail: "Unauthenticated" }, 401))
      .mockResolvedValueOnce(response({ user: { id: user.id, email: user.email } }))
      .mockResolvedValueOnce(response({ success: true })));
    render(<AuthProvider><Account /></AuthProvider>);
    await screen.findByText("Guest");
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByText(`Signed in: ${user.email}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => expect(screen.getByText("Guest")).toBeInTheDocument());
  });
});
