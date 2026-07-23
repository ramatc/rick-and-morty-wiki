import '@testing-library/jest-dom'

// jsdom does not implement matchMedia, which Filter reads at module load.
// Provide a minimal stub so components relying on it can render under test.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
