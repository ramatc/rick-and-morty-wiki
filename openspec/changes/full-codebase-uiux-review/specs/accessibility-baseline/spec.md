# Delta Spec: accessibility-baseline

## ADDED Requirements

### Requirement: The search input MUST be programmatically labeled
The search input in `src/components/Search/index.jsx` MUST have an accessible name exposed to assistive technology (via an associated `<label>`, `aria-label`, or `aria-labelledby`), not a `placeholder` alone.

#### Scenario: Screen reader announces the search input's purpose
- **GIVEN** a screen reader user tabs to the character search input
- **WHEN** the input receives focus
- **THEN** the accessible name announced MUST describe the input's purpose (e.g. "Search characters")
- **AND** MUST NOT rely solely on the `placeholder` attribute, which is not a substitute for an accessible name

---

### Requirement: The Filter mobile toggle MUST be keyboard operable
The mobile filter toggle in `src/components/Filter/index.jsx` MUST be implemented as a real interactive element (e.g. a `<button>`, or a non-button element with `role="button"`, `tabIndex="0"`, and both click and keyboard (`Enter`/`Space`) handlers) instead of an `<h2 onClick>` with no keyboard affordance.

#### Scenario: Toggling the filter panel via keyboard
- **GIVEN** a keyboard-only user has tabbed to the filter toggle control
- **WHEN** the user presses `Enter` or `Space`
- **THEN** the filter panel MUST open or close, matching the behavior of a mouse click
- **AND** focus MUST remain on the toggle control (or move predictably to the revealed panel)

#### Scenario: Filter toggle is reachable via Tab
- **GIVEN** a keyboard-only user is navigating the page with `Tab`
- **WHEN** the user tabs through the filter section
- **THEN** the filter toggle control MUST receive focus in the natural tab order

---

### Requirement: Filter toggle MUST react correctly to viewport size changes and remain operable on desktop
The filter toggle in `src/components/Filter/index.jsx` MUST compute its mobile/desktop mode reactively (not once at module load via a static `matchMedia` check) and MUST invoke the actual open/close state change on every activation, including on desktop.

#### Scenario: Resizing the viewport updates toggle behavior
- **GIVEN** a user has the page open at a desktop width
- **WHEN** the user resizes the browser window to a mobile width without reloading the page
- **THEN** the filter toggle MUST switch to mobile collapse/expand behavior without requiring a page reload

#### Scenario: Activating the toggle on desktop changes state
- **GIVEN** a user is viewing the page at a desktop width
- **WHEN** the user activates the filter toggle control
- **THEN** the filter panel's open/closed state MUST change
- **AND** MUST NOT be a no-op that reassigns state to its current value

---

### Requirement: Filter category buttons MUST expose selection state via aria-pressed
Status, Gender, and Species filter buttons MUST set `aria-pressed="true"` when selected and `aria-pressed="false"` (or omitted appropriately per toggle-button semantics) when not selected.

#### Scenario: Selecting a filter value updates aria-pressed
- **GIVEN** a user activates a filter button (e.g. Status "Alive") that is not currently selected
- **WHEN** the selection is applied
- **THEN** that button's `aria-pressed` attribute MUST become `"true"`
- **AND** any previously selected, now-deselected button in the same category MUST have `aria-pressed="false"`

---

### Requirement: Pagination MUST expose the active page via aria-current
The pagination control (`src/components/Pagination/index.jsx`, backed by `ReactPaginate`) MUST mark the currently active page element with `aria-current="page"`.

#### Scenario: Screen reader identifies the current page
- **GIVEN** a user is on page 3 of paginated results
- **WHEN** a screen reader user navigates the pagination control
- **THEN** the element representing page 3 MUST have `aria-current="page"`
- **AND** no other page element MUST have `aria-current="page"` set simultaneously

---

### Requirement: NavBar links MUST expose the active route via aria-current
`src/components/NavBar` navigation links MUST set `aria-current="page"` on the link matching the currently active route.

#### Scenario: Screen reader identifies the current section
- **GIVEN** a user is on the `/episodes` route
- **WHEN** a screen reader user navigates the nav bar
- **THEN** the "Episodes" nav link MUST have `aria-current="page"`
- **AND** other nav links MUST NOT have `aria-current` set

---

### Requirement: Status, Gender, and Species filters MUST share one generic FilterCategory component
The near-duplicate `src/components/Filter/category/Status.jsx`, `Gender.jsx`, and `Species.jsx` components MUST be replaced by a single generic `FilterCategory` component parameterized by props (e.g. `title`, `values`, `filterKey`), preserving existing filtering behavior and the accessibility requirements above for every category.

#### Scenario: Status filtering behaves identically after consolidation
- **GIVEN** the generic `FilterCategory` component renders the Status category
- **WHEN** a user selects a status value
- **THEN** the resulting filter query and page-reset behavior MUST match the pre-consolidation `Status.jsx` behavior

#### Scenario: Gender filtering behaves identically after consolidation
- **GIVEN** the generic `FilterCategory` component renders the Gender category
- **WHEN** a user selects a gender value
- **THEN** the resulting filter query and page-reset behavior MUST match the pre-consolidation `Gender.jsx` behavior

#### Scenario: Species filtering behaves identically after consolidation
- **GIVEN** the generic `FilterCategory` component renders the Species category
- **WHEN** a user selects a species value
- **THEN** the resulting filter query and page-reset behavior MUST match the pre-consolidation `Species.jsx` behavior

#### Scenario: All three categories retain aria-pressed semantics
- **GIVEN** the generic `FilterCategory` component is used for Status, Gender, and Species
- **WHEN** any category's buttons render
- **THEN** each button MUST expose `aria-pressed` reflecting its selection state, per the aria-pressed requirement above
