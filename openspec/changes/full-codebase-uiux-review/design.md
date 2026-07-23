# Design: Full Codebase UI/UX Review — Phase 1

## Overview

This design details the HOW at architectural level for the five capabilities in the proposal:
`data-reliability`, `character-favorites`, `accessibility-baseline`, `visual-design-system`, and
`testing-baseline`. It stays on the current stack (React 18.2, Vite 4, react-router-dom 6.6.2, plain
JS/JSX, per-component CSS, no state-management library) and adds only Vitest + RTL as new
devDependencies. Router data-API migration and the Vite major bump remain out of scope.

Guiding principle: **improve, don't replace.** Every decision preserves the existing
`src/components/{Name}/index.jsx` + `styles.css` convention and the `useState`/`useEffect` +
custom-hook data flow. No Context, Redux, Zustand, or query library is introduced.

---

## 1. Data-Reliability Architecture

### 1.1 The fetch-in-render loop (P0 correctness fix)

**Current defect** (`Episodes.jsx:27-29`, `Locations.jsx:27-29`): `getEpisodeCount()` /
`getLocationCount()` is called in the component body. Its `.then` calls `setTotal`, which re-renders,
which re-invokes the fetch — an unbounded render/fetch loop on every commit.

**Fix**: move the count fetch into a `useEffect` with an **empty dependency array** (it never changes
during the page's lifetime — the API total is constant), separate from the per-id `useEffect`.

```
useEffect(() => { /* fetch total once, on mount */ }, []);
useEffect(() => { /* fetch selected episode/location */ }, [id]);
```

**Rationale**: the total count is mount-scoped data, the item is id-scoped data. Two effects with
distinct dependency arrays express those two lifetimes correctly and eliminate the loop. Merging them
into one `[id]` effect would re-fetch the constant count on every selection change — wasteful, though
not a loop. Splitting is both correct and cheaper.

### 1.2 Shared fetch wrapper — `src/services/apiClient.js`

**Decision**: introduce ONE module `src/services/apiClient.js` that owns the base URL, the
`response.ok` check, JSON parsing, and a typed error. The three service files call it instead of
calling `fetch` directly.

```
// src/services/apiClient.js
export const API_BASE_URL = 'https://rickandmortyapi.com/api';

export class ApiError extends Error {
  constructor(message, { status, notFound = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.notFound = notFound;   // true when status === 404
  }
}

// path is relative to API_BASE_URL, e.g. `/character/${id}`
export const apiFetch = async (path, { signal } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, {
      status: response.status,
      notFound: response.status === 404,
    });
  }
  return response.json();
};
```

**Rationale — wrapper over repeated try/catch, and over a `useFetch` hook:**
- A **plain async wrapper** (not a hook) is chosen because the services are already async functions
  consumed by effects; a hook would force every call site to be a component and would not compose with
  the existing `getEpisodeById` (which fans out `Promise.all` over sub-resources — see 1.3). The
  wrapper is callable from anywhere, hook-agnostic, and trivially unit-testable with a mocked `fetch`.
- **Centralizing `response.ok`** in one place means the 404-vs-error distinction is defined once. Today
  a 404 resolves to `{error: "..."}` and renders blank fields. `ApiError.notFound` lets the UI branch
  to a real "not found" state.
- Rejected: a `useFetch` React hook. It would work for the page-level single fetches but not for the
  `Promise.all` fan-out inside `getEpisodeById`/`getLocationById`, forcing a split implementation. One
  wrapper covers all cases uniformly.

### 1.3 Service refactor

Each service imports `apiFetch`/`API_BASE_URL`/`ApiError` and drops its hardcoded URL + misnamed
`API_KEY` const.

- `getCharacters.js`: `getAllCharacters(page, search, filters, signal)` and
  `getCharacterById(id, signal)` call `apiFetch('/character/?...', { signal })`. The query string is
  built as before with `encodeURIComponent` (upgrade from `encodeURI` for correct param encoding).
- `getEpisode.js` / `getLocation.js`: `getEpisodeById(id, signal)` calls `apiFetch('/episode/${id}',
  { signal })`, then fans out `Promise.all(data.characters.map(url => apiFetch(url-as-path...)))`. Since
  sub-resource URLs are absolute, keep a thin `fetch(url, { signal }).then(r => r.json())` for the
  fan-out but still forward `signal`. `getEpisodeCount`/`getLocationCount` call `apiFetch('/episode')`.

All service functions accept an optional `signal` forwarded from the caller's `AbortController`.

### 1.4 AbortController + cleanup pattern

**Decision**: every data-fetching `useEffect` creates an `AbortController`, forwards `controller.signal`
to the service, and returns a cleanup that calls `controller.abort()`. The `.catch` swallows
`AbortError` (expected on unmount) and surfaces real errors to an `error` state.

```
useEffect(() => {
  const controller = new AbortController();
  setLoading(true); setError(null);
  getEpisodeById(id, controller.signal)
    .then(res => { setInfoEpisode(res.data); setEpisodeCharacters(res.characters); })
    .catch(err => { if (err.name !== 'AbortError') setError(err); })
    .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  return () => controller.abort();
}, [id]);
```

Applies to: `Episodes` (both effects), `Locations` (both effects), `CharacterDetail`,
`CharacterListContainer` (the debounced fetch — abort the in-flight request when deps change or on
unmount).

**Rationale**: prevents "setState on unmounted component" on fast navigation and cancels stale
in-flight requests when the search/filter/page changes mid-flight, avoiding out-of-order responses
overwriting newer state. Guarding `setLoading` behind `!signal.aborted` avoids a flash of the old
loader after abort.

### 1.5 Remove artificial `setTimeout(750)`

Delete the `setTimeout` wrappers in `Episodes`, `Locations`, `CharacterDetail`. The `Loader` shows
naturally while the promise is pending. No functional purpose; pure added latency.

### 1.6 Error / not-found UI

**Decision**: add an `error` state alongside `loading` in each data-fetching component. Render order:
`loading ? <Loader/> : error ? <ErrorState .../> : <content/>`. Introduce a small reusable
`src/components/ErrorState/index.jsx` (+ `styles.css`) that takes `{ title, message, action }` and
reuses the existing "hole" visual language from `NotFound` for identity consistency.

- `ApiError.notFound === true` → "not found" copy (e.g. "That character doesn't exist in this
  dimension").
- other errors → generic "Something went wrong" copy with a retry affordance where cheap (re-trigger
  the effect via a `retryKey` state increment).

**Rationale**: a dedicated component keeps the three pages consistent and testable, and separates the
routing-404 concern (App.jsx, 1.7) from data-404 (bad id). `NotFound` stays as the "empty results"
component but its copy is clarified in the visual pass (see 6.4).

### 1.7 Catch-all 404 route

**Decision**: add `<Route path='*' element={<NotFoundPage />} />` as the last route in `App.jsx`. Create
`src/pages/NotFoundPage.jsx` — a real routing-level 404 with a link back to `/`. Reuse `ErrorState`
visuals.

**Rationale**: today an unmatched URL renders nothing under `<NavBar/>`. Because router data-APIs
(`errorElement`) are out of scope, the classic `path='*'` catch-all is the correct v6.6 idiom. Also
remove the invalid `exact` props on the existing `<Route>`s — `exact` is a v5 prop, a no-op in v6, and
misleading.

---

## 2. Favorites Feature Architecture

### 2.1 State location — `useFavorites` hook + localStorage

**Decision**: a single custom hook `src/hooks/useFavorites.js` backed by `localStorage`. No Context, no
store library.

```
// key namespaced to avoid collisions
const STORAGE_KEY = 'ramw:favorites:v1';

// Shape stored: array of minimal character snapshots so the Favorites
// view can render cards WITHOUT re-fetching each character by id.
// { id, name, image, species, status, location: { name } }

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => readFromStorage());
  // write-through on change
  useEffect(() => { writeToStorage(favorites); }, [favorites]);
  // cross-tab sync
  useEffect(() => {
    const onStorage = (e) => { if (e.key === STORAGE_KEY) setFavorites(readFromStorage()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isFavorite = (id) => favorites.some(f => f.id === id);
  const toggleFavorite = (character) => setFavorites(prev =>
    prev.some(f => f.id === character.id)
      ? prev.filter(f => f.id !== character.id)
      : [...prev, pickSnapshot(character)]);

  return { favorites, isFavorite, toggleFavorite };
};
```

`readFromStorage` uses a **defensive `try/catch` JSON.parse** returning `[]` on corruption or absent
key (mitigates the corruption risk in the proposal).

**Rationale — hook + localStorage over Context/Redux:**
- The favorites set is small, read/written by a few components, and needs cross-session persistence —
  exactly what `localStorage` + a hook provides. Redux/Zustand would be architectural overkill and
  violate the project's no-state-library convention.
- **Why NOT Context** (even though Context is "allowed"): each consumer calling `useFavorites`
  independently reads the SAME `localStorage` key, and the **`storage` event listener keeps instances
  in sync** — including across tabs, which a bare Context would NOT give for free. Context would add a
  provider in `App.jsx`, centralize state to avoid divergence between hook instances within one tab,
  BUT the write-through + `storage`-event pattern already converges all instances (the `storage` event
  does not fire in the tab that made the change, so within-tab convergence needs care — see 2.2). Given
  the app has few favorite-touching components and cheap card snapshots, the hook keeps the design flat
  and matches the existing convention. If profiling ever shows within-tab divergence problems, wrapping
  the same hook in a Context provider is a non-breaking follow-up.

### 2.2 Within-tab consistency note

The `storage` event does NOT fire in the tab that wrote the change, so two `useFavorites` instances in
the SAME tab won't auto-sync via that event. This is acceptable in Phase 1 because the two live
consumers (a card's toggle and the detail's toggle) are rarely mounted for the same character
simultaneously, and the Favorites view re-reads on mount/route entry. Documented as a known limitation;
the Context upgrade path (2.1) resolves it if needed. This tradeoff is called out explicitly rather than
hidden.

### 2.3 Toggle UI placement

- **`CharacterCard`**: add a favorite toggle button positioned over the card (top-right of the image).
  The card is currently a `<Link>` wrapping everything — the toggle button MUST call
  `e.preventDefault()` + `e.stopPropagation()` so clicking the star does not navigate to the detail
  route. Button: `aria-pressed={isFavorite(id)}`, `aria-label` "Add/Remove favorite".
- **`CharacterDetail`**: add the same toggle in `.detail-info`, next to the name heading.
- Both call `toggleFavorite(character)` with the character object in scope.

**Rationale**: placing the toggle on the card gives one-click favoriting during browsing (the core
wiki-scan flow), and on the detail for deliberate favoriting. `preventDefault` on the nested button is
mandatory because of the existing `<Link>`-as-card structure — a real interaction gotcha grounded in
the current `CharacterCard` markup.

### 2.4 Browse-favorites view

**Decision**: a NEW route `/favorites` → `src/pages/Favorites.jsx`, plus a NavBar link. It renders the
stored snapshots through the existing `CharacterList`/`CharacterCard` (no API calls — data comes from
the snapshot in localStorage). Empty state: a friendly "No favorites yet" using `ErrorState`/`NotFound`
visuals.

**Rationale — new route over a filter on CharacterList:**
- The character list is server-paginated and filtered via API query params; favorites are a **local**
  set that may span many API pages. Filtering the existing list client-side cannot express "all my
  favorites across all pages" without fetching everything. A dedicated route reading local snapshots is
  simpler, instant (no network), and works offline.
- Storing minimal snapshots (not just ids) avoids N per-id fetches to render the favorites grid and
  keeps the view resilient to API downtime — a deliberate space-for-reliability tradeoff.

### 2.5 Favorites data flow (sequence)

```
User clicks star on CharacterCard
        │
        ▼
onClick → e.preventDefault(); e.stopPropagation()   (block Link navigation)
        │
        ▼
toggleFavorite(character)  ── in useFavorites ──►  setFavorites(next)
        │                                                │
        │                                    (React state update)
        ▼                                                ▼
component re-renders                        useEffect([favorites]) writes
isFavorite(id) → true                       JSON.stringify(next) to
star shows "pressed" (aria-pressed=true)    localStorage['ramw:favorites:v1']
        │
        ▼
Other tabs: window 'storage' event fires ──► setFavorites(readFromStorage()) ──► their stars re-render

On /favorites route:
  Favorites.jsx mounts → useFavorites() → favorites (from localStorage)
      → CharacterList renders snapshot cards (no network)
```

---

## 3. FilterCategory Consolidation

### 3.1 Target component

`Status.jsx`, `Gender.jsx`, `Species.jsx` are identical except for the title, the value list, and which
filter key they set. Replace all three with ONE generic `src/components/Filter/category/FilterCategory.jsx`.

```
// props interface
FilterCategory({
  title,        // 'Status' | 'Gender' | 'Species'
  filterKey,    // 'status' | 'gender' | 'species'
  values,       // string[] of option values
  filters,      // current { status, gender, species }
  setFilters,   // setter
  setPageNumber // resets to page 1 on change
})

// on button click:
setFilters({ ...filters, [filterKey]: value });
setPageNumber(1);
// active class: filters[filterKey] === value
```

**Rationale**: driving the differences through props removes ~60 lines of triplicated logic and makes
the a11y wiring (aria-pressed, 4.3) a one-place change. Using `{ ...filters, [filterKey]: value }`
(computed key) is cleaner and less error-prone than the current manual `{ status, gender, species }`
reconstruction, which is easy to get wrong when adding a new filter.

### 3.2 Migration plan

1. Create `FilterCategory.jsx`.
2. In `Filter/index.jsx`, replace the three `<Status/> <Gender/> <Species/>` with three
   `<FilterCategory/>` instances, moving each value list into a local config array:
   ```
   const CATEGORIES = [
     { title: 'Status',  filterKey: 'status',  values: ['alive','dead','unknown'] },
     { title: 'Gender',  filterKey: 'gender',  values: ['female','male','genderless','unknown'] },
     { title: 'Species', filterKey: 'species', values: ['Human','Alien', ... ] },
   ];
   ```
   Render `CATEGORIES.map(c => <FilterCategory key={c.filterKey} {...c} filters={filters}
   setFilters={setFilters} setPageNumber={setPageNumber} />)`.
3. Delete `Status.jsx`, `Gender.jsx`, `Species.jsx`.
4. RTL test covering a filter click sets the right key and resets page to 1 — landed **before/with** the
   refactor per the proposal's regression-safety risk mitigation.

`InputGroup.jsx` stays as-is (different concern — episode/location picker).

---

## 4. Accessibility Fixes

### 4.1 Search input (`Search/index.jsx`)

Current: bare `<input placeholder='Search for characters' />`, no label.

**Change**: associate a visually-hidden `<label htmlFor='character-search'>` (or `aria-label`), add
`type='search'`, `id`, and `name`. The `<form>` gets `role='search'` (or use a `<search>` landmark
concept via `role`). Keep the existing debounce wiring untouched.

```
<form role='search' onSubmit={handleSubmit}>
  <label htmlFor='character-search' className='sr-only'>Search for characters</label>
  <input id='character-search' name='q' type='search'
         aria-label='Search for characters'
         placeholder='Search for characters'
         onChange={...} />
</form>
```

Add a `.sr-only` utility to the global stylesheet (tokens/base layer, section 6).

### 4.2 Filter mobile toggle (`Filter/index.jsx`)

Two problems: `matchMedia` computed once at module load (stale after resize) and the toggle is a
non-interactive `<h2 onClick>` (keyboard-unreachable) with a broken no-op desktop branch.

**Changes**:
- Replace the module-scope `const matchMedia = window.matchMedia(...).matches` with a reactive hook
  `src/hooks/useMediaQuery.js` that subscribes to the `MediaQueryList` `change` event and returns a
  boolean, updating on resize.
- Replace `<h2 onClick=...>` with a real `<button type='button' className='filter-title'
  aria-expanded={!collapsed} aria-controls='filter-panel'>` that toggles collapse. On desktop
  (`!isMobile`) the panel is always shown and the button can be hidden or rendered non-collapsing —
  driven by the reactive `isMobile`, removing the broken `() => setDisplay(display)` no-op branch
  entirely.
- The collapsible panel gets `id='filter-panel'`.

```
const isMobile = useMediaQuery('(max-width: 768px)');
const [collapsed, setCollapsed] = useState(false);
...
{isMobile && (
  <button type='button' className='filter-title'
          aria-expanded={!collapsed} aria-controls='filter-panel'
          onClick={() => setCollapsed(c => !c)}>
    Filters <span aria-hidden='true'>{collapsed ? '▾' : '▴'}</span>
  </button>
)}
<div id='filter-panel' hidden={isMobile && collapsed}> ... </div>
```

**Rationale**: `useMediaQuery` fixes both the staleness and the broken branch with one reactive source
of truth. A `<button>` is natively keyboard-focusable and Enter/Space-activatable — no manual
`tabIndex`/`onKeyDown` needed. `aria-expanded`/`aria-controls` announce the disclosure state to screen
readers. The chevron `<img>` from icongr.am is replaced with an inline `aria-hidden` glyph to drop a
network dependency and an unlabeled image.

### 4.3 aria-pressed / aria-current wiring

- **Filter buttons** (in `FilterCategory`, 3.1): `aria-pressed={filters[filterKey] === value}` on each
  option button — announces the selected filter, replacing the visual-only `active-filter` class.
- **Pagination** (`Pagination/index.jsx`): `ReactPaginate` supports `ariaCurrent` (already emits
  `aria-current` on the active page by default in v8) — verify and set `pageLabelBuilder`/`ariaLabel`
  props for descriptive labels; set `pageRangeDisplayed`/`marginPagesDisplayed` for narrow-screen
  density (also a UX item).
- **NavBar** (`NavBar/index.jsx`): `NavLink` already applies an `active` class; add
  `aria-current='page'` via the `className`/`style` render-prop or rely on v6 `NavLink`'s built-in
  `aria-current='page'` on the active link — confirm it's emitted, and add `aria-label='Main'` to
  `<nav>`. Add the new `/favorites` link here too.

**Rationale**: `aria-pressed` (toggle state) is correct for filter buttons; `aria-current='page'` is
correct for nav/pagination location. Using the semantically right attribute per control type is the
whole point of the a11y pass, not blanket-adding roles.

---

## 5. Testing Setup

### 5.1 Configuration

**Decision**: add Vitest + RTL config INTO `vite.config.js` via the `test` key (Vitest reads the Vite
config directly — no separate `vitest.config.js` needed for a project this small). Add a `setupFiles`
entry for jest-dom matchers.

```
// vite.config.js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
```

```
// src/test/setup.js
import '@testing-library/jest-dom';
```

**devDependencies to add** (versions compatible with Vite 4 / Node — Vitest 1.x line):
`vitest@^1.x`, `@testing-library/react@^14.x`, `@testing-library/jest-dom@^6.x`,
`@testing-library/user-event@^14.x`, `jsdom@^23.x`.

**package.json scripts**:
```
"test": "vitest run",
"test:watch": "vitest",
"lint": "standard"
```

**Rationale**: Vitest is Vite-native — it reuses the existing `@vitejs/plugin-react` transform, so JSX
"just works" with zero extra Babel/SWC config. Inlining `test` into `vite.config.js` avoids a second
config file and keeps the setup discoverable. `globals: true` lets tests use `describe/it/expect`
without imports (lower friction for the first tests in the repo). Pinning to the Vitest 1.x line avoids
pulling a toolchain that expects newer Vite than v4. `standard` is finally wired to `npm run lint` per
the proposal.

### 5.2 Test files

Co-locate tests next to sources as `*.test.jsx` / `*.test.js`:

| Test file | Covers |
|-----------|--------|
| `src/pages/Episodes.test.jsx` | **Regression**: count fetch fires exactly ONCE on mount (mock `getEpisodeCount`, assert call count === 1 after render + a state update) — proves the render-loop fix. Item fetch fires on `id` change. |
| `src/pages/Locations.test.jsx` | Same regression shape for locations. |
| `src/hooks/useFavorites.test.js` | toggle add/remove, `isFavorite`, persistence to localStorage, defensive parse of corrupt JSON → `[]`. |
| `src/components/CharacterCard.test.jsx` | Favorite star toggles `aria-pressed` and does NOT navigate (preventDefault). |
| `src/services/apiClient.test.js` | `apiFetch` throws `ApiError` with `notFound:true` on 404, resolves JSON on ok. |
| `src/components/Filter/category/FilterCategory.test.jsx` | Clicking an option sets the right filter key and resets page to 1 (guards the consolidation refactor). |

**Rationale**: coverage is scoped to the proposal's explicit targets (Episodes/Locations fetch fix +
Favorites) plus the two refactors that carry regression risk (apiClient, FilterCategory). This is the
"pragmatic baseline," not full coverage.

---

## 6. Visual Design System

### 6.1 Token location — `src/styles/tokens.css`

**Decision**: create `src/styles/tokens.css` defining CSS custom properties on `:root`, imported ONCE at
the top of `src/index.css` (which is already imported in `main.jsx` and is the global entry). Component
`styles.css` files then reference `var(--...)` instead of raw hex.

**Rationale**: a dedicated file is a single, discoverable source of truth and keeps `index.css`
(which holds the heavy inline SVG background) uncluttered. `:root` scope makes tokens available to every
component stylesheet with no build step — pure CSS, matching the no-preprocessor convention.

### 6.2 Token structure

Grounded in the current palette (`#1cc49d` teal-green primary, `#40b5cb` cyan accent, `#17c3b227`
translucent teal, `#fafafa` near-white, `#0e2a47` navy background from `index.css`), evolved into scales:

```
:root {
  /* Brand / primary (teal-green) */
  --color-primary-100: #d6f5ec;
  --color-primary-300: #6fdcc0;
  --color-primary-500: #1cc49d;   /* current primary */
  --color-primary-700: #159a7b;
  --color-primary-900: #0d6b55;

  /* Secondary / accent (cyan) */
  --color-accent-500: #40b5cb;    /* current accent */
  --color-accent-300: #7fd0df;
  --color-accent-700: #2c8697;

  /* Neutral (surface = navy, text = near-white) */
  --color-bg: #0e2a47;            /* body background base */
  --color-surface: #14314f;
  --color-surface-raised: #1b3b5e;
  --color-text: #fafafa;
  --color-text-muted: rgba(250, 250, 250, 0.72);
  --color-border: rgba(250, 250, 250, 0.16);

  /* Translucent overlays (from #17c3b227) */
  --color-primary-alpha: rgba(28, 196, 157, 0.15);

  /* Semantic status (align with character status colors) */
  --color-status-alive: var(--color-primary-500);
  --color-status-dead:  #e0564f;
  --color-status-unknown: var(--color-text-muted);
  --color-danger: #e0564f;
  --color-focus: var(--color-accent-500);   /* focus ring */

  /* Spacing scale (4px base) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-8: 48px;

  /* Radius */
  --radius-sm: 4px; --radius-md: 6px; --radius-lg: 12px;

  /* Type scale */
  --font-sans: 'Roboto', sans-serif;
  --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.25rem;
  --text-xl: 1.5rem;   --text-2xl: 2rem;

  /* Elevation */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.35);
  --shadow-focus: 0 0 0 3px var(--color-focus);
}
```

**Rationale**: numeric scales (100–900) let the visual pass introduce hover/active/disabled shades
without inventing ad-hoc hex per component. Mapping character-status colors to semantic tokens keeps the
existing `.character-status.alive/.dead/.unknown` classes but sources them from one place. A dedicated
`--color-focus` + `--shadow-focus` supports the accessibility work (visible focus rings, section 4).
Spacing/type scales replace the current px/em/rem mix flagged in exploration.

### 6.3 Migration approach for CSS

Touched `styles.css` files replace raw hex/spacing with `var(--...)`. Per the proposal's diff-size risk,
this lands as its **own reviewable slice** within the change (one commit for tokens + mechanical
substitution), separate from behavioral commits. No visual regression intended — tokens are seeded from
the current values, so the default appearance is preserved, then selectively improved (hover states,
focus rings, spacing rhythm).

### 6.4 State treatments (design-level)

- **Loading**: keep the existing custom `Loader` animation; ensure it's centered in its container and
  respects `--space-*` rhythm. Add a lightweight inline "searching…" indicator near the search box
  during the 350ms debounce (distinct from the full-page loader) — token-driven, subtle.
- **Empty (no results)**: `NotFound` keeps its portal-"hole" animation but its copy becomes
  context-aware — pass a `message` prop so the character list can say "No characters match your search"
  vs. a generic empty. Sourced through tokens (`--color-text-muted`).
- **Error**: new `ErrorState` component (1.6) — clear title + message + optional retry button, using
  `--color-danger` for the accent and reusing the hole/portal motif so errors feel on-brand, not like a
  browser error. 404 (routing) and not-found (data) share the visual, differ in copy.
- **Focus visible**: global `:focus-visible { outline: none; box-shadow: var(--shadow-focus); }` on
  interactive elements so keyboard users get a clear, on-brand focus ring — ties the a11y and visual
  systems together.

**Rationale**: the app already has real CSS craft (loader, hole animation). The design deliberately
**evolves** those motifs into the error/empty states rather than replacing them, preserving the Rick and
Morty identity while closing the "blank screen on failure" gap.

---

## 7. New / Modified File Map

| Path | New/Mod | Purpose |
|------|---------|---------|
| `src/services/apiClient.js` | New | Base URL, `apiFetch`, `ApiError` |
| `src/services/getCharacters.js` | Mod | Use `apiClient`, `signal`, `encodeURIComponent` |
| `src/services/getEpisode.js` | Mod | Use `apiClient`, `response.ok`, `signal` |
| `src/services/getLocation.js` | Mod | Use `apiClient`, `response.ok`, `signal` |
| `src/pages/Episodes.jsx` | Mod | Split effects, abort, error state, drop setTimeout |
| `src/pages/Locations.jsx` | Mod | Same as Episodes |
| `src/pages/NotFoundPage.jsx` | New | Routing 404 page |
| `src/pages/Favorites.jsx` | New | Browse favorites view |
| `src/components/CharacterDetail/index.jsx` | Mod | Abort, error state, favorite toggle, drop setTimeout |
| `src/components/CharacterListContainer/index.jsx` | Mod | Abort in debounced fetch, error state |
| `src/components/CharacterCard/index.jsx` | Mod | Favorite star (preventDefault on Link) |
| `src/components/ErrorState/index.jsx` + `styles.css` | New | Shared error/not-found UI |
| `src/components/Filter/index.jsx` | Mod | `useMediaQuery`, real `<button>` toggle, config-driven categories |
| `src/components/Filter/category/FilterCategory.jsx` | New | Generic filter category |
| `src/components/Filter/category/{Status,Gender,Species}.jsx` | Del | Replaced by `FilterCategory` |
| `src/components/Search/index.jsx` | Mod | Label, `type=search`, `role=search` |
| `src/components/Pagination/index.jsx` | Mod | aria-current, range/margin props |
| `src/components/NavBar/index.jsx` | Mod | aria-current, `/favorites` link, `aria-label` |
| `src/hooks/useFavorites.js` | New | localStorage favorites hook |
| `src/hooks/useMediaQuery.js` | New | Reactive media query hook |
| `src/App.jsx` | Mod | `path='*'` 404 route, `/favorites` route, drop `exact` |
| `src/styles/tokens.css` | New | CSS custom-property tokens |
| `src/index.css` | Mod | Import tokens, add `.sr-only`, `:focus-visible` ring |
| Component `styles.css` (touched) | Mod | Replace raw hex/spacing with `var(--...)` |
| `vite.config.js` | Mod | Vitest `test` block |
| `src/test/setup.js` | New | jest-dom setup |
| `package.json` | Mod | test/lint scripts, Vitest+RTL devDeps |
| `src/**/*.test.{js,jsx}` | New | Test files (5.2) |

---

## 8. Architecture Decision Summary

| # | Decision | Chosen | Rejected alternative | Why |
|---|----------|--------|----------------------|-----|
| D1 | Fetch loop fix | Two effects (`[]` + `[id]`) | Single `[id]` effect | Correct data lifetimes; avoids re-fetching constant count |
| D2 | Shared fetch | `apiClient.js` async wrapper | `useFetch` hook / repeated try-catch | Composes with `Promise.all` fan-out; one place for `response.ok` |
| D3 | Cancellation | `AbortController` per effect | Mounted-flag guard | Actually cancels network + avoids stale writes |
| D4 | 404 route | `path='*'` catch-all | Router data-API `errorElement` | Data-API migration is out of scope |
| D5 | Favorites state | `useFavorites` + localStorage + `storage` event | Context / Redux | Matches no-store convention; cross-session + cross-tab for free |
| D6 | Favorites store shape | Minimal card snapshots | id-only + refetch | Instant render, offline-resilient (space-for-reliability) |
| D7 | Favorites view | New `/favorites` route | Client filter on list | Favorites span many API pages; local set can't be a query param |
| D8 | Filter categories | One prop-driven `FilterCategory` | Keep 3 files | Removes triplication; single a11y touchpoint |
| D9 | Media query | Reactive `useMediaQuery` hook | Module-scope `matchMedia` | Fixes staleness + broken desktop branch |
| D10 | Test config | Inline `test` in `vite.config.js`, Vitest 1.x | Separate `vitest.config.js`, Jest | Vite-native, one config, Vite-4 compatible |
| D11 | Tokens | `src/styles/tokens.css` on `:root` | Tokens in `App.css` | Discoverable single source; keeps SVG-heavy `index.css` clean |

---

## 9. Risks & Open Questions

- **Within-tab favorites divergence** (2.2): accepted limitation; Context upgrade path documented.
- **Vitest/RTL version alignment with Vite 4**: pin to Vitest 1.x + jsdom 23.x; verify at install time.
  If a peer conflict appears, that's the one place the test-setup slice may need version adjustment.
- **CSS token migration diff size** (6.3): mitigated by landing tokens as an isolated slice; requires
  care that seeded values match current appearance exactly to avoid unintended visual regression.
- **`react-paginate` aria support**: assumes v8 emits `aria-current` on the active page; confirm during
  apply, add wrapper `aria` props if not.
- **`Favorites` snapshot staleness**: a favorited character's data (e.g. `status`) is frozen at
  favorite-time in the snapshot. Acceptable for Phase 1 (data is near-static); a future "refresh
  favorites" action could re-fetch. Noted, not addressed here.
