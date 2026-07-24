import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from './useFavorites'

const STORAGE_KEY = 'ramw:favorites:v1'

// A full character object as it arrives from the API — the hook must persist
// only a minimal snapshot of it, never the whole thing.
const rick = {
  id: 1,
  name: 'Rick Sanchez',
  image: 'rick.png',
  species: 'Human',
  status: 'Alive',
  location: { name: 'Earth (C-137)' },
  gender: 'Male',
  origin: { name: 'Earth (C-137)' },
  episode: ['ep-1', 'ep-2'],
}

const morty = {
  id: 2,
  name: 'Morty Smith',
  image: 'morty.png',
  species: 'Human',
  status: 'Alive',
  location: { name: 'Earth' },
}

describe('useFavorites', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts empty when localStorage holds no favorites', () => {
    const { result } = renderHook(() => useFavorites())

    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite(1)).toBe(false)
  })

  it('adds a character on first toggle and marks it favorite', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => { result.current.toggleFavorite(rick) })

    expect(result.current.isFavorite(1)).toBe(true)
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].name).toBe('Rick Sanchez')
  })

  it('removes a character on the second toggle', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => { result.current.toggleFavorite(rick) })
    act(() => { result.current.toggleFavorite(rick) })

    expect(result.current.isFavorite(1)).toBe(false)
    expect(result.current.favorites).toHaveLength(0)
  })

  it('stores only a minimal snapshot, not the full character object', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => { result.current.toggleFavorite(rick) })

    expect(result.current.favorites[0]).toEqual({
      id: 1,
      name: 'Rick Sanchez',
      image: 'rick.png',
      species: 'Human',
      status: 'Alive',
      location: { name: 'Earth (C-137)' },
    })
    expect(result.current.favorites[0]).not.toHaveProperty('gender')
    expect(result.current.favorites[0]).not.toHaveProperty('episode')
    expect(result.current.favorites[0]).not.toHaveProperty('origin')
  })

  it('write-through: serializes the snapshot to localStorage', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => { result.current.toggleFavorite(morty) })

    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(JSON.parse(raw)).toEqual([
      {
        id: 2,
        name: 'Morty Smith',
        image: 'morty.png',
        species: 'Human',
        status: 'Alive',
        location: { name: 'Earth' },
      },
    ])
  })

  it('persists favorites across a hook re-mount (localStorage-backed)', () => {
    const first = renderHook(() => useFavorites())
    act(() => { first.result.current.toggleFavorite(rick) })
    first.unmount()

    // A brand-new hook instance must read the persisted value back.
    const second = renderHook(() => useFavorites())

    expect(second.result.current.isFavorite(1)).toBe(true)
    expect(second.result.current.favorites[0].name).toBe('Rick Sanchez')
  })

  it('returns an empty list when the stored JSON is corrupt', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-valid-json')

    const { result } = renderHook(() => useFavorites())

    expect(result.current.favorites).toEqual([])
  })

  it('re-reads storage when another tab fires a storage event', () => {
    const { result } = renderHook(() => useFavorites())
    expect(result.current.isFavorite(1)).toBe(false)

    // Simulate a different tab writing to the same key.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 1,
          name: 'Rick Sanchez',
          image: 'rick.png',
          species: 'Human',
          status: 'Alive',
          location: { name: 'Earth (C-137)' },
        },
      ])
    )

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
    })

    expect(result.current.isFavorite(1)).toBe(true)
  })
})
