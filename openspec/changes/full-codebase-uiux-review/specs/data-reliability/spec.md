# Delta Spec: data-reliability

## ADDED Requirements

### Requirement: Episodes and Locations pages MUST NOT re-fetch on every render
The `Episodes` page (`src/pages/Episodes.jsx`) and `Locations` page (`src/pages/Locations.jsx`) MUST invoke `getEpisodeCount()` / `getLocationCount()` exactly once per relevant dependency change, via `useEffect`, and MUST NOT call them directly in the component body.

#### Scenario: Episodes page mounts and fetches count once
- **GIVEN** a user navigates to `/episodes`
- **WHEN** the `Episodes` component mounts
- **THEN** `getEpisodeCount()` is invoked exactly once
- **AND** subsequent re-renders caused by unrelated state changes do not trigger additional calls to `getEpisodeCount()`

#### Scenario: Locations page mounts and fetches count once
- **GIVEN** a user navigates to `/locations`
- **WHEN** the `Locations` component mounts
- **THEN** `getLocationCount()` is invoked exactly once
- **AND** subsequent re-renders caused by unrelated state changes do not trigger additional calls to `getLocationCount()`

#### Scenario: setTotal update does not re-trigger the fetch
- **GIVEN** the `Episodes` or `Locations` page has already fetched its count
- **WHEN** the fetch resolves and `setTotal` updates component state
- **THEN** the resulting re-render MUST NOT re-invoke the count fetch (no render/fetch loop)

---

### Requirement: Service calls MUST validate response status before parsing
`getCharacters.js`, `getEpisode.js`, and `getLocation.js` MUST check `response.ok` (or equivalent HTTP status check) before treating the response body as valid data, and MUST reject/throw a recognizable error when the check fails.

#### Scenario: Non-OK response from getCharacters is rejected
- **GIVEN** `getAllCharacters`/`getCharacters` calls the Rick and Morty API
- **WHEN** the API responds with a non-2xx status (e.g. 404 for an invalid filter combination)
- **THEN** the service function MUST NOT resolve with the raw API error payload as if it were character data
- **AND** the service function MUST reject or throw so the caller can distinguish failure from success

#### Scenario: Non-OK response from getEpisode is rejected
- **GIVEN** `getEpisode(id)` requests a specific episode
- **WHEN** the API responds with a 404 (episode id does not exist)
- **THEN** the service function MUST NOT resolve as if the episode was found
- **AND** the service function MUST reject or throw a recognizable "not found" error

#### Scenario: Non-OK response from getLocation is rejected
- **GIVEN** `getLocation(id)` requests a specific location
- **WHEN** the API responds with a 404 (location id does not exist)
- **THEN** the service function MUST NOT resolve as if the location was found
- **AND** the service function MUST reject or throw a recognizable "not found" error

---

### Requirement: Failed or not-found API responses MUST render a user-facing state
Every page/component that calls `getCharacters`, `getEpisode`, or `getLocation` (`CharacterDetail`, `CharacterListContainer`, `Episodes`, `Locations`) MUST render a visible error or not-found UI when the underlying service call fails, instead of leaving blank/`undefined` fields or only logging to the console.

#### Scenario: Character detail shows not-found state for invalid id
- **GIVEN** a user navigates to `/character/999999` (an id that does not exist)
- **WHEN** `getCharacter`/equivalent rejects with a not-found error
- **THEN** `CharacterDetail` MUST render a visible "character not found" message
- **AND** MUST NOT render blank or `undefined` character fields

#### Scenario: Character list shows error state on network failure
- **GIVEN** a user is on the character list page
- **WHEN** the underlying fetch to the characters API fails (network error or non-2xx response)
- **THEN** the page MUST render a visible error state distinct from the loading and empty-results states
- **AND** MUST NOT silently render an empty or stale list without explanation

#### Scenario: Episodes/Locations pages show error state on fetch failure
- **GIVEN** a user is on `/episodes` or `/locations`
- **WHEN** the count or list fetch fails
- **THEN** the page MUST render a visible error state
- **AND** MUST NOT rely solely on `console.log`/`console.error` for failure visibility

---

### Requirement: Data-fetching effects MUST clean up on unmount
Every `useEffect` that performs a data fetch (in `CharacterDetail`, `CharacterListContainer`, `Episodes`, `Locations`) MUST use an `AbortController` (or equivalent cancellation mechanism) and MUST NOT call `setState` after the owning component has unmounted.

#### Scenario: Fast navigation away from CharacterDetail does not warn or throw
- **GIVEN** a user opens `/character/1` and the detail fetch is in flight
- **WHEN** the user navigates away before the fetch resolves
- **THEN** the in-flight request MUST be aborted or its result MUST be ignored
- **AND** no `setState` call MUST occur on the unmounted `CharacterDetail` component

#### Scenario: Fast navigation away from Episodes/Locations does not warn or throw
- **GIVEN** a user opens `/episodes` (or `/locations`) and the count/list fetch is in flight
- **WHEN** the user navigates to another route before the fetch resolves
- **THEN** the in-flight request MUST be aborted or its result MUST be ignored
- **AND** no `setState` call MUST occur on the unmounted page component

---

### Requirement: API base URL MUST be centralized in a single shared constant
The three service files (`src/services/getCharacters.js`, `getEpisode.js`, `getLocation.js`) MUST import the Rick and Morty API base URL from one shared module instead of hardcoding `https://rickandmortyapi.com/api/...` independently in each file. The exported constant MUST NOT be named `API_KEY` (it is a URL, not a credential).

#### Scenario: Base URL is defined once and reused
- **GIVEN** the codebase after this change
- **WHEN** any of `getCharacters.js`, `getEpisode.js`, `getLocation.js` needs the API base URL
- **THEN** it MUST reference a single shared constant/module rather than a locally hardcoded string literal
- **AND** the shared constant's name MUST accurately describe its purpose (e.g. `API_BASE_URL`), not `API_KEY`

---

### Requirement: Unmatched routes MUST show a real 404 page
`src/App.jsx` MUST define a catch-all `*` route that renders a dedicated 404/not-found page, distinct from the existing `NotFound` empty-state component used for "no search results".

#### Scenario: Navigating to an unknown path shows 404
- **GIVEN** a user navigates directly to an undefined path (e.g. `/this-route-does-not-exist`)
- **WHEN** `react-router-dom` fails to match any defined route
- **THEN** the app MUST render a dedicated 404 page via the catch-all `*` route
- **AND** MUST NOT render a blank page or crash

---

### Requirement: Artificial fetch delays MUST be removed
The `setTimeout(..., 750)` delays wrapping fetch logic in `CharacterDetail/index.jsx`, `Episodes.jsx`, and `Locations.jsx` MUST be removed; loading states MUST reflect only real fetch latency.

#### Scenario: Loading state duration matches actual fetch time
- **GIVEN** a user navigates to a page that fetches data (character detail, episodes, or locations)
- **WHEN** the underlying API responds
- **THEN** the loading indicator MUST clear as soon as the response is processed
- **AND** MUST NOT be artificially held visible for a fixed extra delay unrelated to network latency
