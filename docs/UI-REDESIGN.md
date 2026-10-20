# Grillr UI redesign

## 1. Design tokens

The source of truth is `frontend/app/globals.css`.

```css
:root {
  --background: #0a0a0b;
  --foreground: #f5f5f7;
  --muted: #9a9aa2;
  --caption: #8b8b95;
  --surface: #131315;
  --surface-raised: #1a1a1d;
  --border: rgba(255,255,255,.08);
  --border-strong: rgba(255,255,255,.14);
  --focus-ring: rgba(255,255,255,.4);
  --space: .5rem;
  --radius-card: 24px;
  --radius-control: 14px;
  --radius-pill: 999px;
  --shadow-soft: 0 8px 24px rgba(0,0,0,.15);
  --shadow-card: 0 20px 60px rgba(0,0,0,.24);
  --shadow-glass: inset 0 1px 0 rgba(255,255,255,.18), 0 6px 18px rgba(0,0,0,.2);
  --text-hero: clamp(4rem, 2.5rem + 5vw, 7.25rem);
  --text-title: clamp(2rem, 1.2rem + 2.6vw, 3.5rem);
  --text-body: 1rem;
}
```

Geist remains the typeface. Fonts use `display: swap`. Muted green, amber, and red are reserved for status. The navbar keeps its original dimensions, links, and behavior. A follow-up request changes its finish to transparent monochrome glass, with a 20px blur, soft highlight, and white account CTA.

## 2. Reusable glass buttons

Complete component: `frontend/components/ui/button.tsx` (also reproduced in `UI-REDESIGN-FULL-SOURCE.md`).

`GlassButton` offers `primary`, `secondary`, `ghost`, and `icon` variants; `sm`, `md`, and `lg` sizes; and an accessible `loading` spinner. `Button` is retained as an alias, so existing imports continue working. The shared `.glass-button` classes also style anchor CTAs. Existing native buttons receive the same treatment through selectors that explicitly exclude the navbar.

All non-navbar buttons have a minimum 44px target, prefixed 18px backdrop blur, saturate(140%), highlight/shadow, hover lift, active scale, focus ring, disabled opacity, and a solid-color fallback. Reduced-motion preferences suppress movement.

## 3. Updated files

**[Full changed files, in delivery order](UI-REDESIGN-FULL-SOURCE.md)** contains complete source, not snippets: button, landing page, remaining pages, shared styles, and components. The files in the repository are the implemented versions.

Pages audited: landing, login, signup, onboarding, dashboard, history, interview setup, live interview and completed results, privacy, AI Core, and the existing alternate voice-demo source. Added matching not-found and route-error views. The `/interview` recovery redirect is unchanged.

## 4. Checklist and assumptions

- [x] Dark monochrome tokens, fluid headings, generous section spacing, hairline dividers, and elevated panels.
- [x] Three-line hero, gradient final line, account CTA, how-it-works link, and free-start note.
- [x] Tilted laptop illustration with timer, Live status, waveform, and working presentation-only mute/pause/end/replay controls. It never records audio.
- [x] Three-column benefit strip and three connected practice steps.
- [x] Feedback example with keyboard-accessible tabs, 8.2/10 score, progress bar, and tip.
- [x] Moody photographic hero and CTA, plus footer with required links and tagline.
- [x] Existing FAQ and dashboard entry retained.
- [x] Forms, OAuth actions, dropdowns, autocomplete, cards, badges, feedback, progress indicators, and coding/transcript surfaces themed consistently.
- [x] Live question centered; voice controls restyled; waveform follows existing microphone activity; read-only elapsed timer added.
- [x] Real result scores use their existing 0–100 scale. The landing example uses 8.2/10 and is labeled as an example.
- [x] Loading placeholders, empty states, error styling, focus states, semantic progress bars, and reduced-motion support.
- [x] Local images served through Next Image, explicit responsive sizes, hero priority, lazy CTA image, and no new package dependencies.
- [x] Product metadata and tracked product documentation use Grillr. The navbar's descriptive “INTERVIEW COACH” tagline remains unchanged.

**Assumptions / limitations**

- No reference screenshot was attached to the conversation. The implementation follows the written specification rather than claiming a pixel-identical match.
- No image assets were supplied. Local grayscale architectural and mountain photographs are included as replaceable mood imagery. Supply the intended concrete/rock photographs for an exact imagery match.
- There are no standalone settings/profile pages, toast system, or modal components in the current active app; no new product workflows were invented.
- The existing live screen exposes recording and question-audio controls plus an exit link. Those actions were retained; no unsupported mute/end API functionality was introduced. The landing controls are explicitly a demo.
- Some AI Core controls already have demonstration behavior. Their behavior remains as it was.
- The local backend returned an unavailable response during review. Protected screens were exercised using browser-only mock fixtures; live OAuth, transcription, and speech-provider integration were not verified against a running backend.
- The user's pre-existing untracked root `PRODUCT.md` was left alone.

**Validation**

- Production build and TypeScript: passed.
- ESLint: passed.
- Existing frontend suite: 12 files, 38 tests passed.
- Browser review: 48 page/viewport combinations across 360, 768, 1024, and 1440px; no horizontal overflow or broken images; visible non-navbar buttons meet the 44px minimum.
- Browser interaction checks: feedback tab keyboard navigation, demo pause/end/replay, job autocomplete, custom dropdown keyboard selection, mobile menu/Escape, and reduced motion passed.
- No page JavaScript errors in the browser review.
- Navbar links, layout, and behavior are preserved. The original logo markup was extracted into a shared component for consistent branding. Before the follow-up color request, compared navbar dimensions, spacing, fonts, colors, backgrounds, and shadows matched the original CSS at all four widths. The authorized follow-up updates only visual navbar colors, translucency, blur, and shadows.
- A syntax-tree comparison confirmed that non-render behavior in 26 existing TSX files is unchanged. Backend, API handlers, auth libraries, data models, and routing/proxy files were not modified.
- `git diff --check`: passed.

Preview: [desktop](ui-review/home-1440.png), [mobile](ui-review/home-360.png). Browser check data: [report](ui-review/report.json).

Photography sources (downloaded locally; no runtime requests to Unsplash):

- [Architectural photograph](https://images.unsplash.com/photo-1487958449943-2429e8be8625)
- [Mountain photograph](https://images.unsplash.com/photo-1519681393784-d120267933ba)

## 5. Preservation confirmation

The navbar component, links, order, layout, and behavior are preserved. Its colors and glass finish were subsequently updated at the explicit request of the user. Business logic, API calls, authentication, existing application state handling, routing, and models remain unchanged. New state is limited to the landing illustration, feedback preview, and read-only timer display. This report records local validation before publication. Deployment is outside this UI refactor.

## Modern Web Guidance

- `typography`: I combined rem and viewport units in fluid headings and applied balanced wrapping only to headings, following “DON'T use vw alone for font-size without clamp()”.
- `visual-effects`: I retained an ordinary gradient fallback and enabled explicit Oklab interpolation only when supported, following “Some pre-2024 browsers do not support gradient color interpolation space.”

## Shared logo update

The navbar artwork is the canonical `frontend/public/grillr-logo.svg`. `GrillrLogo` and `GrillrBrand` reuse it in the navbar, footer, laptop preview, sign-in, sign-up, onboarding, error view, and interview/demo branding. Both favicon files are generated from the same artwork. Sign-up displays the logo on small screens too.

Build and lint passed for the logo extraction.

- `icons`: I used one shared SVG asset with a root-relative URL, following “use a root-relative URL”, so nested routes cannot resolve the logo against the wrong directory.

## Flat dropdown options

Dropdown choices and job-title suggestions now use flat, borderless rows instead of separate glass buttons. Shared glass styles explicitly exclude options and buttons inside options, including their hover, active, and unsupported-blur fallback states. A subtle fill shows hover, the selected value, keyboard activity, and focus without an outline box. Selection handlers and keyboard behavior are unchanged.

Modern Web Guidance: I checked dropdown styling in modern-web-guidance; native customizable-select guidance was not applied because this correction preserves the existing custom listbox.
