import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

// Build a controllable MediaQueryList stub. jsdom does not implement a real
// one, so the hook's subscription is exercised against this fake.
const createMatchMedia = (initialMatches) => {
  let listeners = []
  const mql = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: (_event, listener) => { listeners.push(listener) },
    removeEventListener: (_event, listener) => { listeners = listeners.filter(l => l !== listener) },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    // Test-only helper to simulate a viewport change.
    _emit (matches) {
      mql.matches = matches
      listeners.forEach(listener => listener({ matches }))
    }
  }
  return mql
}

describe('useMediaQuery', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns the initial match state from matchMedia', () => {
    const mql = createMatchMedia(true)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql)

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))

    expect(result.current).toBe(true)
  })

  it('reacts to a media query change event', () => {
    const mql = createMatchMedia(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql)

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => { mql._emit(true) })
    expect(result.current).toBe(true)

    act(() => { mql._emit(false) })
    expect(result.current).toBe(false)
  })

  it('unsubscribes the change listener on unmount', () => {
    const mql = createMatchMedia(false)
    const removeSpy = vi.spyOn(mql, 'removeEventListener')
    vi.spyOn(window, 'matchMedia').mockReturnValue(mql)

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    unmount()

    expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
