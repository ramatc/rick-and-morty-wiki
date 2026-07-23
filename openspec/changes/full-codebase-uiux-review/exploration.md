## Exploration: full-codebase-uiux-review

### Current State

**Architecture**: React 18.2 + Vite 4 SPA, plain JSX (no TS despite `@types/react`/`@types/react-dom` devDeps). Convention is `src/components/{Name}/index.jsx` + co-located `styles.css`, `src/pages/` for route-level views, `src/services/` for API calls (three files: `getCharacters.js`, `getEpisode.js`, `getLocation.js`). No state management library — local `useState`/`useEffect` only, no Context. Routing via `react-router-dom` 6.6.2 with 4 flat routes in `src/App.jsx` (`/`, `/episodes`, `/locations`, `/character/:id`), no nested routes, no lazy loading (`React.lazy`), no catch-all `*` route (no true 404 page — `NotFound` component exists but is only used for "no results" empty states, not routing 404s). No test runner, no CI, no lint script wired despite `standard` devDependency, no `.env` handling.

### Affected Areas (Code Quality / Architecture)

- `src/pages/Episodes.jsx:27-29` and `src/pages/Locations.jsx:27-29` — **critical bug**: `getEpisodeCount()`/`getLocationCount()` is called directly in the component body (not inside `useEffect`), on every render. Since the `.then` callback calls `setTotal`, this triggers a re-render, which re-invokes the fetch, which sets state again — an uncontrolled render/fetch loop firing on every commit for the lifetime of the page.
- `src/components/CharacterDetail/index.jsx:16-23`, `src/pages/Episodes.jsx:17-24`, `src/pages/Locations.jsx:17-24` — arbitrary `setTimeout(..., 750)` wrapping every fetch purely to force the loader to show; adds fixed artificial latency to every navigation for no functional reason.
- `src/services/getCharacters.js`, `getEpisode.js`, `getLocation.js` — no `response.ok` check anywhere; a 404 from the API (e.g. bad character/episode/location id) still resolves and is parsed as JSON (`{error: "..."}`), silently rendering blank/`undefined` fields instead of a "not found" state. `getEpisode.js`/`getLocation.js` have **no try/catch at all** (unlike `getCharacters.js`), so a network failure throws unhandled into the component's `.catch` only if present — but there's no user-facing error UI anywhere, only `console.log(err)`.
- `src/services/getCharacters.js:5`, `getEpisode.js:3`, `getLocation.js:3` — base URL `https://rickandmortyapi.com/api/...` is hardcoded 3x with no shared constant, no `.env`/`import.meta.env`. Variable is misleadingly named `API_KEY` when it's a full URL string, not a key.
- No `AbortController`/cleanup in any `useEffect` performing a fetch — if a component unmounts mid-request (fast navigation), `setState` still fires on the stale closure.
- `src/components/Filter/index.jsx:7` — `const matchMedia = window.matchMedia('(max-width: 768px)').matches;` is computed **once at module load**, not reactively; resizing the viewport after load won't update the mobile filter-toggle behavior. Also line 22's toggle handler is a no-op ternary (`matchMedia ? () => setDisplay(!display) : () => setDisplay(display)` — the "else" branch sets state to its own current value, effectively disabling the click on desktop, which happens to be harmless only because the container class is gated by `matchMedia` too).
- `src/components/Filter/category/{Status,Gender,Species}.jsx` — near-identical components (same shape: static list + button group + `setFilters`/`setPageNumber` calls), duplicated three times instead of one generic `FilterCategory` component driven by props (`title`, `values`, `filterKey`).
- No React error boundaries anywhere in the tree (`App.jsx`, `main.jsx`).
- No `package.json` `"lint"` script despite `standard` in devDependencies — dead/unused tooling.
- No accessibility affordances: `Search/index.jsx` input has only a `placeholder`, no `<label>`/`aria-label`; filter buttons and pagination have no `aria-pressed`/`aria-current`; `Filter` mobile toggle (`<h2 onClick>`) is not a real interactive element (no `role="button"`, `tabIndex`, or keyboard handler) — unreachable via keyboard.
- `README.md` — Spanish-only, no English translation, no scripts/lint/test section, no architecture overview, no environment setup beyond `npm install`/`npm run dev`.

### Affected Areas (UI/UX)

- `src/App.css`, all component `styles.css` — plain CSS, no design tokens/CSS variables (colors like `#1cc49d`, `#17c3b227`, `#40b5cb`, `#fafafa` repeated raw across ~8 files with no single source of truth), inconsistent spacing units (px mixed with em/rem).
- Responsive breakpoints exist only in `App.css` (`532px`, `768px`, `1200px`) plus one in `CharacterList/styles.css` (`1200px` min-width) and none in `Filter/styles.css`, `CharacterCard/styles.css`, `Pagination/styles.css`, `NavBar/styles.css` — layout for the character-card grid, filter sidebar, and nav bar has no fine-grained mobile handling beyond the two `App.css` global breakpoints; small phones (<375px) not specifically targeted.
- `CharacterListContainer/index.jsx` — filters sidebar (`w-20`) is 20%-width fixed, with `Filter/styles.css` mobile collapse only reachable via the buggy toggle above; on mobile the filter section reflows via `.rows { flex-direction: column-reverse }` (filters shown below results) — no sticky/persistent filter access while scrolling a long result list.
- No "Favorites"/bookmark feature for a wiki-type app — none of the 8 components reference localStorage or any persistence.
- `Pagination/index.jsx` — `ReactPaginate` has no `pageRangeDisplayed`/`marginPagesDisplayed` props set, so default page-number density is used without responsive adjustment for narrow screens.
- Search UX: no clear ("x") button on the input, no visual feedback while the 350ms debounce is pending (no inline spinner distinct from the full-page `Loader`), and typing a search resets to page 1 correctly (`Search/index.jsx:14`) but there's no "no results for X" messaging distinct from the generic `NotFound` component (which says "No Characters Found" regardless of search vs. filter vs. genuinely empty page).
- `CharacterDetail/index.jsx` — no breadcrumb/back-context beyond a plain `Go back` button using `navigate(-1)` (breaks if the detail page is opened directly via URL/shared link — `navigate(-1)` with no history entry does nothing useful).

### Dependencies (package.json)

| Package | Current | Note |
|---|---|---|
| `react` / `react-dom` | ^18.2.0 | Reasonable, though React 19 has been stable for a while by 2026 — worth a future major-version evaluation, not urgent. |
| `react-router-dom` | ^6.6.2 | Very early 6.x (Dec 2022); missing 2+ years of 6.x fixes and the data-router APIs (`createBrowserRouter`, loaders, `errorElement`) that would directly solve the missing-404/error-boundary gaps above. |
| `vite` | ^4.0.0 | Two major versions behind (6/7 current as of 2026); `@vitejs/plugin-react` ^3.0.0 similarly dated. |
| `react-paginate` | ^8.1.4 | Fine, low risk. |
| `just-debounce-it` | 3.2.0 | Fine, tiny, low risk; pinned exact version (no `^`) — inconsistent with the rest of the file. |
| `standard` | ^17.0.0 | Installed but never invoked (no npm script, no CI) — currently dead weight. |
| `@types/react`, `@types/react-dom` | ^18.0.x | Present in a plain-JS project — only useful for editor intellisense; harmless but signals either abandoned TS intent or copy-paste from a template. |

No security-critical CVEs expected for a client-only SPA hitting a public read-only API, but the Vite/react-router-dom versions are stale enough to matter for a "considerably improved" pass.

### Concrete Strengths

- Consistent, predictable file convention (`index.jsx` + `styles.css` per component) makes navigation easy.
- Debounced search (`just-debounce-it`, 350ms) is correctly wired via `useCallback` to avoid re-creating the debounced fn every render (`CharacterListContainer/index.jsx:18-25`).
- Filters (`status`/`gender`/`species`) and search combine cleanly into one query object passed to `getAllCharacters`, and changing any of them resets to page 1 consistently.
- `key` usage in all `.map()` lists is correct (`character.id`, static string values for filter buttons) — no index-as-key anti-pattern found.
- Pagination position is synced with the query string params sent to the API and the `ReactPaginate` `forcePage`, avoiding page/URL state desync.
- CSS shows real design effort (custom loader animation, portal-style "hole" animation for empty states) — this is not a bare-bones unstyled app.

### Approaches Considered

1. **Full ground-up rewrite (new stack: TS + Tailwind/CSS Modules + TanStack Query + React Router v6 data APIs)**
   - Pros: Solves all data-layer gaps (caching, retries, abort) for free via a query library; TS eliminates prop-shape bugs; router data APIs give native error/404 boundaries.
   - Cons: Total rewrite risk for a fully working ~2-year-old app; large diff, hard to review incrementally; discards existing CSS design work; contradicts the "considerably improve" framing (implies iterate, not replace).
   - Effort: High.

2. **Incremental hardening + UX pass on the current stack** (fix the render-loop bug, add error/not-found states, centralize API base URL, extract shared `FilterCategory`, add abort/cleanup, wire `standard` lint script, improve a11y, add missing 404 route, introduce a small design-token layer in CSS, add favorites via `localStorage`)
   - Pros: Directly fixes the concrete bugs found (episode/location render loop is a real production issue), preserves working behavior and existing visual identity, reviewable in slices, matches "improve" not "replace" framing, no new heavy dependencies required.
   - Cons: Doesn't get TS's compile-time safety; some architectural debt (no state management, plain CSS) remains by design.
   - Effort: Medium.

3. **Hybrid: incremental hardening (Approach 2) + selective library upgrades** (bump `react-router-dom` to latest 6.x or migrate to data-router APIs for native error/404/loader handling; bump Vite; optionally add TanStack Query only for the data layer, keep plain CSS/JS everywhere else)
   - Pros: Gets native 404/error boundary support and out-of-the-box caching/retry/abort without a full framework rewrite; still incremental and reviewable; addresses the stale-dependency finding.
   - Cons: React Router data-router migration touches `App.jsx` and all page-level data-fetching patterns at once — larger single-PR surface than Approach 2 alone; needs its own slice/PR boundary.
   - Effort: Medium-High.

### Recommendation

Approach 3, sequenced as Approach 2 first (bug fixes + UX + DX, no dependency churn) then a follow-up slice for the `react-router-dom` data-router migration once the base is stable. This fixes the confirmed production bug (Episodes/Locations render loop) and the missing error/404 handling immediately, without betting the whole review on a stack replacement the user didn't ask for.

### Risks

- The Episodes/Locations render-loop bug (`getEpisodeCount`/`getLocationCount` called in render body) should be treated as a correctness fix, not an "improvement" — flag it as priority 0 regardless of which approach is chosen.
- No test runner exists, so any refactor (especially the Filter category consolidation and API-layer changes) has zero regression safety net — the proposal/design phase should decide whether to introduce a minimal test setup (Vitest + RTL fits the Vite stack) before or alongside the refactor.
- CSS has no design-token layer; a "considerable" UI/UX improvement without introducing at least CSS custom properties will keep the inconsistent-color-repetition problem indefinitely.
- Migrating to React Router's data-router APIs is a structural change to `App.jsx` and every page's data-fetching pattern — should be scoped as its own reviewable slice, not bundled into the first PR.

### Prioritized Improvement Opportunities (impact vs. effort)

| # | Item | Impact | Effort | Notes |
|---|---|---|---|---|
| 1 | Fix Episodes/Locations fetch-in-render loop | High | Low | `src/pages/Episodes.jsx:27-29`, `src/pages/Locations.jsx:27-29` — move into `useEffect` |
| 2 | Add error/not-found UI for failed or 404 API responses | High | Low-Med | Check `response.ok` in all `src/services/*.js`, surface a real error state instead of `console.log` |
| 3 | Add catch-all `*` route + real 404 page | High | Low | `src/App.jsx` — currently no unmatched-route handling |
| 4 | Centralize API base URL / rename `API_KEY` → proper name | Med | Low | `src/services/*.js` |
| 5 | Remove artificial `setTimeout(750)` delays | Med | Low | `CharacterDetail`, `Episodes`, `Locations` |
| 6 | Add abort/cleanup on unmount for all data-fetching effects | Med | Low | All `useEffect` fetches |
| 7 | Extract shared `FilterCategory` component | Med | Low | Removes 3x duplication in `Filter/category/*.jsx` |
| 8 | Accessibility pass (label/aria on Search, keyboard-reachable Filter toggle, aria-current on nav/pagination) | Med-High | Med | `Search`, `Filter`, `NavBar`, `Pagination` |
| 9 | Fix `Filter` mobile `matchMedia` staleness + broken desktop toggle branch | Med | Low | `src/components/Filter/index.jsx:7,22` |
| 10 | Introduce CSS custom properties (design tokens) for color/spacing | Med | Med | Cross-cutting, all `styles.css` |
| 11 | Wire `standard` into an actual `npm run lint` script (or replace with ESLint) | Low-Med | Low | `package.json` |
| 12 | Add Favorites feature (localStorage) | Med | Med | New feature, matches "wiki browsing" UX gap |
| 13 | Bump `react-router-dom`/`vite`, evaluate data-router migration | Med | Med-High | Separate slice per Risks section |
| 14 | Add minimal test setup (Vitest + RTL) | Med | Med | No regression net exists today |
| 15 | README rewrite (bilingual or English, dev/lint/test instructions) | Low | Low | `README.md` |

### Ready for Proposal

Yes. The codebase is small (8 components, 2 pages, 3 services, ~1.2k LOC estimate) and fully read. The proposal phase should confirm scope boundaries with the user (e.g., is a Favorites feature in scope, is the router data-API migration in scope for this change or a follow-up) before locking the spec.
