# Tasks: Full Codebase UI/UX Review — Phase 1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,100–1,300 (additions + deletions) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 → PR 6 (per phase below) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Test infra + data-reliability fixes (Phase 1) | PR 1 | Largest unit (~450 lines); consider splitting infra-setup vs. fetch-fix if reviewer load is a concern |
| 2 | FilterCategory consolidation (Phase 2) | PR 2 | Depends on PR 1 (ErrorState import in Filter not required, but stable fetch pattern helps review) |
| 3 | Accessibility fixes (Phase 3) | PR 3 | Depends on PR 2 (touches same Filter files) |
| 4 | Visual design tokens + state styling (Phase 4) | PR 4 | Independent; can run parallel to PR 3, largest CSS diff (~250 lines) |
| 5 | Favorites feature (Phase 5) | PR 5 | Depends on stable CharacterCard/CharacterDetail (PR 1) |
| 6 | Lint wiring + final verification (Phase 6) | PR 6 | Trivial, depends on all prior units landing |

## Phase 1: Data-Reliability & Testing Infrastructure (Foundation)

- [x] 1.1 Add Vitest+RTL `test` block to `vite.config.js`, create `src/test/setup.js`, add devDeps and `test`/`test:watch` scripts to `package.json`
- [x] 1.2 Create `src/services/apiClient.js` (`API_BASE_URL`, `apiFetch`, `ApiError`); write `src/services/apiClient.test.js`
- [x] 1.3 Refactor `getCharacters.js`, `getEpisode.js`, `getLocation.js` to use `apiClient`, forward `signal`, use `encodeURIComponent`, drop `API_KEY` const
- [x] 1.4 Create `src/components/ErrorState/index.jsx` + `styles.css` (title/message/action props)
- [x] 1.5 Fix `Episodes.jsx`: split into `[]` + `[id]` effects, add `AbortController`, add error state, remove `setTimeout(750)`
- [x] 1.6 Fix `Locations.jsx`: same pattern as 1.5
- [x] 1.7 Write `src/pages/Episodes.test.jsx` + `Locations.test.jsx` — regression: count fetch called exactly once on mount
- [x] 1.8 Add `AbortController` + error state to `CharacterDetail/index.jsx`, remove `setTimeout(750)`
- [x] 1.9 Add `AbortController` + error state to `CharacterListContainer/index.jsx` debounced fetch
- [x] 1.10 Create `src/pages/NotFoundPage.jsx`, add catch-all `path='*'` route in `App.jsx`, remove invalid `exact` props

## Phase 2: FilterCategory Consolidation

- [x] 2.1 Create `src/components/Filter/category/FilterCategory.jsx` (props: `title`, `filterKey`, `values`, `filters`, `setFilters`, `setPageNumber`)
- [x] 2.2 Update `Filter/index.jsx` to render `FilterCategory` via a `CATEGORIES` config array; delete `Status.jsx`, `Gender.jsx`, `Species.jsx`
- [x] 2.3 Write `FilterCategory.test.jsx` — click sets correct filter key and resets page to 1

## Phase 3: Accessibility Fixes

- [x] 3.1 `Search/index.jsx`: add `<label>`, `id`, `type='search'`, `role='search'` on form
- [x] 3.2 Create `src/hooks/useMediaQuery.js` (reactive `MediaQueryList` subscription)
- [x] 3.3 `Filter/index.jsx`: replace static `matchMedia` with `useMediaQuery`; replace `<h2 onClick>` with real `<button aria-expanded aria-controls>`; fix broken desktop no-op branch
- [x] 3.4 Add `aria-pressed` to `FilterCategory` option buttons
- [x] 3.5 `Pagination/index.jsx`: verify/set `aria-current`, `pageLabelBuilder`/`ariaLabel`, `pageRangeDisplayed`
- [x] 3.6 `NavBar/index.jsx`: confirm `aria-current='page'` on active `NavLink`, add `aria-label='Main'`, add `/favorites` link

## Phase 4: Visual Design System

- [x] 4.1 Create `src/styles/tokens.css` (color/spacing/type/radius/shadow custom properties, seeded from current palette)
- [x] 4.2 Import tokens once in `src/index.css`; add `.sr-only` utility and `:focus-visible` ring
- [x] 4.3 Migrate touched component `styles.css` files to `var(--...)` tokens (mechanical substitution, own commit)
- [ ] 4.4 Update `NotFound` with context-aware `message` prop; style `ErrorState` with `--color-danger` and hole/portal motif
- [ ] 4.5 Add inline "searching…" indicator near search box during debounce

## Phase 5: Favorites Feature

- [ ] 5.1 Create `src/hooks/useFavorites.js` (localStorage-backed, `storage` event sync, defensive JSON parse)
- [ ] 5.2 Add favorite toggle to `CharacterCard/index.jsx` (`preventDefault`/`stopPropagation`, `aria-pressed`)
- [ ] 5.3 Add favorite toggle to `CharacterDetail/index.jsx`
- [ ] 5.4 Create `src/pages/Favorites.jsx` + `/favorites` route in `App.jsx` (NavBar link done in 3.6)
- [ ] 5.5 Write `useFavorites.test.js` + `CharacterCard.test.jsx` (add/remove, persistence, no-navigate on toggle)

## Phase 6: Finalization

- [ ] 6.1 Wire `npm run lint` script using `standard` in `package.json`
- [ ] 6.2 Manual verification against proposal's Success Criteria checklist
