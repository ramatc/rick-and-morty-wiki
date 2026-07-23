# Delta Spec: visual-design-system

## ADDED Requirements

### Requirement: Colors MUST be defined as CSS custom properties, not duplicated raw values
Color values currently repeated as raw hex/rgba literals across `src/App.css` and component `styles.css` files (e.g. `#1cc49d`, `#17c3b227`, `#40b5cb`, `#fafafa`) MUST be defined once as CSS custom properties (e.g. on `:root`) and referenced via `var(...)` everywhere they are used.

#### Scenario: A touched stylesheet references a color token instead of a raw hex value
- **GIVEN** a component's `styles.css` file is modified as part of this change
- **WHEN** the file needs the app's primary accent color (or any other shared brand color)
- **THEN** it MUST reference a CSS custom property (e.g. `var(--color-accent)`)
- **AND** MUST NOT contain a raw hex/rgba literal duplicating a value already defined as a token

---

### Requirement: Spacing MUST follow a consistent scale defined via CSS custom properties
Spacing values (margins, paddings, gaps) in touched stylesheets MUST reference a shared scale of CSS custom properties instead of ad hoc, inconsistently mixed px/em/rem literals.

#### Scenario: A touched stylesheet uses a spacing token
- **GIVEN** a component's `styles.css` file is modified as part of this change
- **WHEN** the file sets a margin, padding, or gap value
- **THEN** it MUST reference a shared spacing custom property (e.g. `var(--space-md)`) where the value corresponds to a defined scale step
- **AND** MUST NOT introduce a new arbitrary spacing value with no relation to the defined scale without justification

---

### Requirement: Typography MUST follow a defined scale via CSS custom properties
Font sizes and weights used across touched stylesheets MUST reference a shared typographic scale defined as CSS custom properties, establishing a clear visual hierarchy (e.g. page titles vs. card titles vs. body text).

#### Scenario: A touched stylesheet uses a typography token
- **GIVEN** a component's `styles.css` file is modified as part of this change
- **WHEN** the file sets a `font-size` or `font-weight` for a text element
- **THEN** it MUST reference a shared typography custom property (e.g. `var(--font-size-lg)`)
- **AND** the resulting hierarchy MUST be visually distinguishable between heading and body levels

---

### Requirement: Loading, empty, and error states MUST each have a distinct, clear visual treatment
The app MUST present visually distinguishable states for "loading" (data in flight), "empty" (a valid response with no results, e.g. no search matches), and "error" (a failed request or not-found response), so a user can tell them apart without reading fine print.

#### Scenario: Loading state is visually distinct
- **GIVEN** a page is fetching data (characters, episodes, locations, or character detail)
- **WHEN** the fetch is in flight
- **THEN** the page MUST render a loading indicator visually distinct from both the empty and error treatments

#### Scenario: Empty state is visually distinct from error state
- **GIVEN** a search or filter combination legitimately returns zero results
- **WHEN** the page renders the empty-results state
- **THEN** the visual treatment MUST be distinguishable from the error/not-found treatment
- **AND** MUST communicate that the query was valid but returned nothing (not that something failed)

#### Scenario: Error state is visually distinct from empty state
- **GIVEN** a request fails or returns a not-found response (per the `data-reliability` spec)
- **WHEN** the page renders the resulting error/not-found state
- **THEN** the visual treatment MUST be distinguishable from the empty-results treatment
- **AND** MUST communicate that a failure occurred (not that the query legitimately had no matches)

---

### Requirement: The visual refresh MUST evolve, not replace, the existing Rick and Morty identity
Design-token adoption and state-treatment improvements MUST retain and build on existing brand-identifying visual elements already present in the codebase (e.g. the custom loader animation and the portal-style "hole" animation used for empty states), rather than discarding them for a generic redesign.

#### Scenario: Existing signature animations remain present after the refresh
- **GIVEN** the app already has a custom loader animation and a portal-hole empty-state animation
- **WHEN** the visual design system change is applied
- **THEN** both animations MUST still be present and functionally equivalent (may be restyled with tokens, but not removed or replaced with a generic/off-the-shelf equivalent)
