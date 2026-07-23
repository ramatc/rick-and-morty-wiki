# Delta Spec: testing-baseline

## ADDED Requirements

### Requirement: The project MUST have a working Vitest + React Testing Library setup
The project MUST include Vitest and React Testing Library as devDependencies, a Vitest configuration compatible with the existing Vite setup, and a `test` script in `package.json` that runs the suite non-interactively.

#### Scenario: Running the test script executes the suite
- **GIVEN** a developer has run `npm install` on a clean checkout
- **WHEN** the developer runs `npm run test`
- **THEN** Vitest MUST execute all test files in the project
- **AND** the command MUST exit with a non-zero status if any test fails, and zero if all tests pass

---

### Requirement: A regression test MUST cover the Episodes/Locations fetch-in-render fix
The test suite MUST include at least one test per page (`Episodes`, `Locations`) that asserts the count-fetching function (`getEpisodeCount()` / `getLocationCount()`) is called exactly once per mount and is not re-invoked on subsequent re-renders caused by state updates from that same fetch.

#### Scenario: Episodes count fetch is called once across re-renders
- **GIVEN** the `Episodes` component is rendered in a test environment with a mocked `getEpisodeCount`
- **WHEN** the component mounts and the mocked fetch resolves, triggering a state update
- **THEN** the test MUST assert `getEpisodeCount` was called exactly once

#### Scenario: Locations count fetch is called once across re-renders
- **GIVEN** the `Locations` component is rendered in a test environment with a mocked `getLocationCount`
- **WHEN** the component mounts and the mocked fetch resolves, triggering a state update
- **THEN** the test MUST assert `getLocationCount` was called exactly once

---

### Requirement: Tests MUST cover adding, removing, and persisting favorites
The test suite MUST include tests that verify: (1) toggling favorite status adds a character to favorites, (2) toggling it again removes it, and (3) favorite state is restored from `localStorage` on a fresh render/mount simulating a reload.

#### Scenario: Adding a favorite is reflected in state
- **GIVEN** a `CharacterCard` (or `CharacterDetail`) is rendered for a character that is not favorited
- **WHEN** the test activates the favorite toggle
- **THEN** the test MUST assert the character's id is present in the favorites store/localStorage

#### Scenario: Removing a favorite is reflected in state
- **GIVEN** a `CharacterCard` (or `CharacterDetail`) is rendered for a character that is favorited
- **WHEN** the test activates the favorite toggle
- **THEN** the test MUST assert the character's id is no longer present in the favorites store/localStorage

#### Scenario: Favorites persist across a simulated reload
- **GIVEN** a character has been favorited and `localStorage` contains the corresponding entry
- **WHEN** the component tree is unmounted and re-mounted (simulating a page reload) with the same `localStorage` state
- **THEN** the test MUST assert the character is rendered as favorited immediately, without requiring a new user action
