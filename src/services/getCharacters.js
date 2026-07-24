import { apiFetch } from './apiClient'

export const getAllCharacters = async (pageNumber, search, filters, signal) => {
  const { status, gender, species } = filters

  const query = new URLSearchParams({
    page: pageNumber,
    name: search,
    status,
    gender,
    species
  }).toString()

  return apiFetch(`/character/?${query}`, { signal })
}

export const getCharacterById = async (id, signal) => {
  if (id === '') return null

  return apiFetch(`/character/${encodeURIComponent(id)}`, { signal })
}
