# Proposal: Full Codebase UI/UX Review — Phase 1 (Hardening, Favorites, Testing, Visual Refresh)

## Intent

The app has a confirmed production bug (Episodes/Locations pages re-fetch on every render due to a fetch call in the component body, not `useEffect`), no error/404 handling anywhere (API failures silently render blank fields), no accessibility affordances on core controls, no design-token layer (colors/spacing repeated raw across ~8 files), and zero regression safety net. This phase-1 change fixes the confirmed defects, closes the accessibility and error-handling gaps, adds a favorites feature users expect from a "wiki" browsing app, and establishes a pragmatic test baseline — all on the current stack, so it ships as a reviewable, low-risk iteration rather than a rewrite.

## Scope

### In Scope
- Fix Episodes/Locations fetch-in-render infinite loop (P0)
- `response.ok` checks + user-facing error/not-found states in `getCharacters.js`, `getEpisode.js`, `getLocation.js`
- Catch-all `*` 404 route in `App.jsx`
- `AbortController`/cleanup on all data-fetching `useEffect`s
- Extract shared `FilterCategory` component (removes Status/Gender/Species duplication)
- Accessibility pass: labeled search input, keyboard-reachable Filter toggle, `aria-pressed`/`aria-current` on filters/pagination/nav
- Fix stale `matchMedia` computation and broken desktop toggle branch in `Filter`
- Wire `standard` into an `npm run lint` script (or swap for an equivalent)
- Centralize API base URL, rename misleading `API_KEY`
- Remove artificial `setTimeout(750)` delays
- Favorites: localStorage-backed toggle on `CharacterCard`/`CharacterDetail`, dedicated view to browse favorited characters
- Minimal test setup: Vitest + RTL, `npm run test`, coverage of the Episodes/Locations fetch fix and Favorites
- Visual refresh on current CSS: design tokens (color/spacing/typography), clearer hierarchy, improved empty/loading/error states — evolves the existing Rick and Morty identity, doesn't replace it

### Out of Scope
- `react-router-dom` Data Router API migration (recommended follow-up change)
- Vite 4→6/7 and `@vitejs/plugin-react` major bumps (recommended follow-up change)
- React 19 upgrade, TypeScript migration, Tailwind/CSS-in-JS adoption, state-management library
- Full app test coverage (pragmatic baseline only)
- README rewrite (deferred, low priority)

## Capabilities

### New Capabilities
- `data-reliability`: fetch bug fixes, error/404 states, abort/cleanup, centralized API config
- `character-favorites`: localStorage favorites toggle + browse view
- `accessibility-baseline`: keyboard/screen-reader access on search, filters, pagination, nav
- `visual-design-system`: CSS custom-property tokens, typographic hierarchy, state treatments
- `testing-baseline`: Vitest + RTL wired with baseline coverage

### Modified Capabilities
None — no prior `openspec/specs/` exist for this project.

## Approach

Approach 3 (exploration), sequenced: this change delivers Approach 2 (incremental hardening, no dependency churn) plus Favorites and the test baseline. The router data-API migration and Vite bump become a separate follow-up slice once this base is stable, since they touch `App.jsx` and every page's fetch pattern at once and deserve their own review boundary.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/Episodes.jsx`, `Locations.jsx` | Modified | Move fetch into `useEffect`, add abort/error state |
| `src/services/*.js` | Modified | `response.ok` checks, shared base URL constant |
| `src/App.jsx` | Modified | Catch-all 404 route |
| `src/components/Filter/**` | Modified | `FilterCategory` extraction, `matchMedia` fix, a11y |
| `src/components/Search`, `Pagination`, `NavBar` | Modified | Accessibility attributes |
| `src/components/CharacterCard`, `CharacterDetail` | Modified | Favorites toggle |
| `src/pages/` (new route) | New | Favorites browse view |
| `src/App.css`, `**/styles.css` | Modified | Design tokens, visual refresh |
| `package.json`, `vitest.config.js` (new) | New/Modified | Test runner, lint script |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| FilterCategory extraction regresses filter behavior | Med | Cover with RTL tests before/alongside refactor |
| Visual token pass touches most `styles.css` files, inflating diff size | Med | Land as its own reviewable slice within this change |
| Favorites localStorage key collisions/corruption | Low | Namespaced key, defensive JSON parse with fallback |
| Test setup friction (first test runner in repo) | Low | Vitest is Vite-native, minimal config |

## Rollback Plan

Deployed on Vercel (`rick-and-morty-wiki-kappa.vercel.app`) with auto-deploy from the main branch. If an issue surfaces post-merge: `git revert` the offending commit(s) and push — Vercel redeploys automatically; alternatively use Vercel's dashboard "Instant Rollback" to the last known-good deployment while the revert lands. No database/migration state involved (client-only SPA against a public read-only API), so rollback is purely code-level.

## Dependencies
- None new. Vitest/RTL added as devDependencies only (no runtime dependency change).

## Success Criteria
- [x] Episodes/Locations pages no longer re-fetch on every render (PR 1 — split effects, regression-tested)
- [x] API failures and 404s show real UI states, not blank/`undefined` content (PR 1 — `ErrorState`, tested)
- [x] Direct URL to unmatched route shows a real 404 page (PR 1 — catch-all route, tested)
- [x] Search input, filter toggle, and pagination are fully keyboard/screen-reader accessible (PR 3 — labeled input, `aria-expanded`/`aria-controls` toggle button, `aria-pressed`/`aria-current`, tested)
- [x] Users can favorite a character and view their favorites list, persisted across reloads (PR 5 — `useFavorites` + `/favorites`, persistence tested across hook re-mount)
- [x] `npm run test` runs and passes, covering Episodes/Locations fetch fix + Favorites (55/55 passing, 16 suites)
- [x] `npm run lint` runs successfully (PR 6 — `standard` wired, 0 problems after fixing the 734 pre-existing violations it surfaced)
- [x] Visual refresh applied via CSS custom properties (PR 4 — `tokens.css`; scope per design.md §6.3 was color-only, exact-value substitution — raw hex that didn't exactly match a token, plus all spacing/typography, was intentionally left as-is and deferred, not eliminated. Some raw hex remains in `Filter`, `NavBar`, `CharacterDetail`, `CharacterListContainer`, `Search` styles.css)
