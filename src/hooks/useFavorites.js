import { useState, useEffect } from 'react'

// Namespaced + versioned key so a future shape change can migrate cleanly.
const STORAGE_KEY = 'ramw:favorites:v1'

// Store a MINIMAL snapshot so the Favorites view can render cards without
// re-fetching each character by id. Never persist the full API object.
const pickSnapshot = ({ id, name, image, species, status, location }) => ({
  id,
  name,
  image,
  species,
  status,
  location: { name: location?.name }
})

// Defensive read: a corrupt or absent value must degrade to an empty list,
// never throw and break every consumer of the hook.
const readFromStorage = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeToStorage = (favorites) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Storage full or unavailable (private mode): keep favorites in memory
    // for this session rather than crashing the UI.
  }
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => readFromStorage())

  // Write-through: every state change is persisted immediately.
  useEffect(() => {
    writeToStorage(favorites)
  }, [favorites])

  // Cross-tab sync: the storage event fires in OTHER tabs when this key
  // changes (never in the tab that made the change — see design §2.2).
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setFavorites(readFromStorage())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isFavorite = (id) => favorites.some((favorite) => favorite.id === id)

  const toggleFavorite = (character) =>
    setFavorites((prev) =>
      prev.some((favorite) => favorite.id === character.id)
        ? prev.filter((favorite) => favorite.id !== character.id)
        : [...prev, pickSnapshot(character)])

  return { favorites, isFavorite, toggleFavorite }
}

export default useFavorites
