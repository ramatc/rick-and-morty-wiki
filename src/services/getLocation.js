import { apiFetch, apiFetchUrl } from './apiClient'

export const getLocationById = async (number, signal) => {
  const data = await apiFetch(`/location/${encodeURIComponent(number)}`, { signal })

  const residents = await Promise.all(
    data.residents.map((url) => apiFetchUrl(url, { signal }))
  )

  return { data, residents }
}

export const getLocationCount = async (signal) => {
  const data = await apiFetch('/location', { signal })

  return data.info.count
}
