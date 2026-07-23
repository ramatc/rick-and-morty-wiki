# Delta Spec: character-favorites

## ADDED Requirements

### Requirement: Users MUST be able to toggle a character's favorite status from the character card
`CharacterCard` (`src/components/CharacterCard/index.jsx`) MUST expose a control that toggles the favorite state of the character it represents.

#### Scenario: Favoriting a character from the list
- **GIVEN** a user is viewing the character list and a character is not currently favorited
- **WHEN** the user activates the favorite toggle on that character's `CharacterCard`
- **THEN** the character MUST be marked as favorited
- **AND** the toggle control MUST visually reflect the new favorited state

#### Scenario: Unfavoriting a character from the list
- **GIVEN** a user is viewing the character list and a character is currently favorited
- **WHEN** the user activates the favorite toggle on that character's `CharacterCard`
- **THEN** the character MUST be removed from favorites
- **AND** the toggle control MUST visually reflect the new unfavorited state

---

### Requirement: Users MUST be able to toggle a character's favorite status from the detail page
`CharacterDetail` (`src/components/CharacterDetail/index.jsx`) MUST expose a control that toggles the favorite state of the character being viewed, independent of whether it was reached from a favorited card.

#### Scenario: Favoriting a character from its detail page
- **GIVEN** a user has navigated to `/character/:id` for a character that is not currently favorited
- **WHEN** the user activates the favorite toggle on `CharacterDetail`
- **THEN** the character MUST be marked as favorited
- **AND** the toggle control MUST visually reflect the new favorited state

#### Scenario: Favorite state is consistent between card and detail views
- **GIVEN** a character has been favorited from `CharacterDetail`
- **WHEN** the user navigates back to the character list
- **THEN** the corresponding `CharacterCard` MUST display that character as favorited

---

### Requirement: Favorite state MUST persist across page reloads via localStorage
Favorited character ids MUST be stored under a namespaced `localStorage` key and MUST be read back to restore favorite state on app load, without requiring a network request.

#### Scenario: Favorites survive a full page reload
- **GIVEN** a user has favorited one or more characters
- **WHEN** the user reloads the browser tab
- **THEN** the previously favorited characters MUST still be marked as favorited in both `CharacterCard` and `CharacterDetail`

#### Scenario: Corrupted favorites data does not crash the app
- **GIVEN** the `localStorage` favorites key contains malformed or non-JSON data (e.g. manually edited by a user)
- **WHEN** the app initializes and reads the favorites key
- **THEN** the app MUST fall back to an empty favorites set instead of throwing an unhandled error
- **AND** the character list and detail pages MUST render normally

---

### Requirement: Users MUST have a dedicated view to browse only favorited characters
The app MUST provide a distinct, navigable view (e.g. a new route reachable from `NavBar`) that lists only the characters currently marked as favorited.

#### Scenario: Viewing the favorites list with favorited characters
- **GIVEN** a user has favorited at least one character
- **WHEN** the user navigates to the favorites view
- **THEN** the view MUST display exactly the characters currently marked as favorited
- **AND** MUST NOT display characters that are not favorited

#### Scenario: Viewing the favorites list with no favorites
- **GIVEN** a user has not favorited any characters
- **WHEN** the user navigates to the favorites view
- **THEN** the view MUST render an empty state indicating no favorites exist yet
- **AND** MUST NOT render an error or blank page

#### Scenario: Unfavoriting from the favorites view updates the list immediately
- **GIVEN** a user is on the favorites view with at least one favorited character
- **WHEN** the user unfavorites a character from that view
- **THEN** the character MUST be removed from the favorites view without requiring a page reload
