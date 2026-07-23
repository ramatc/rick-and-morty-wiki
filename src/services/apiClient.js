export const API_BASE_URL = 'https://rickandmortyapi.com/api'

export class ApiError extends Error {
  constructor (message, { status, notFound = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.notFound = notFound // true when status === 404
  }
}

// path is relative to API_BASE_URL, e.g. `/character/${id}`
export const apiFetch = async (path, { signal } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal })

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, {
      status: response.status,
      notFound: response.status === 404,
    })
  }

  return response.json()
}

// For absolute sub-resource URLs (e.g. character URLs returned inside an
// episode/location payload). Still validates response.ok and forwards signal.
export const apiFetchUrl = async (url, { signal } = {}) => {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, {
      status: response.status,
      notFound: response.status === 404,
    })
  }

  return response.json()
}
