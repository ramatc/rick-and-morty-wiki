import { useEffect, useState } from 'react'

// Reactive replacement for one-shot `window.matchMedia(query).matches` reads.
// Subscribes to the MediaQueryList `change` event so consumers re-render when
// the viewport crosses the breakpoint, and cleans the listener up on unmount.
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handleChange = (event) => setMatches(event.matches)

    // Sync immediately in case the query changed between render and effect.
    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)

    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export default useMediaQuery
