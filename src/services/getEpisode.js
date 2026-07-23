import { apiFetch, apiFetchUrl } from './apiClient'

export const getEpisodeById = async (id, signal) => {
  const data = await apiFetch(`/episode/${encodeURIComponent(id)}`, { signal })

  const characters = await Promise.all(
    data.characters.map((url) => apiFetchUrl(url, { signal }))
  )

  return { data, characters }
}

export const getEpisodeCount = async (signal) => {
  const data = await apiFetch('/episode', { signal })

  return data.info.count
}
