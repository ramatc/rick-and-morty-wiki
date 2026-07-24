import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiFetch, apiFetchUrl, ApiError, API_BASE_URL } from './apiClient'

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves parsed JSON on an ok response', async () => {
    const payload = { id: 1, name: 'Rick Sanchez' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload)
    }))

    const result = await apiFetch('/character/1')

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/character/1`, { signal: undefined })
    expect(result).toEqual(payload)
  })

  it('throws an ApiError with notFound=true on a 404 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Character not found' })
    }))

    await expect(apiFetch('/character/999999')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      notFound: true
    })
  })

  it('throws an ApiError with notFound=false on a non-404 error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({})
    }))

    const error = await apiFetch('/character/1').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.notFound).toBe(false)
  })

  it('forwards the abort signal to fetch', async () => {
    const controller = new AbortController()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    }))

    await apiFetch('/episode', { signal: controller.signal })

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/episode`, { signal: controller.signal })
  })

  it('apiFetchUrl fetches an absolute url and validates status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 2 })
    }))

    const result = await apiFetchUrl('https://rickandmortyapi.com/api/character/2')

    expect(fetch).toHaveBeenCalledWith('https://rickandmortyapi.com/api/character/2', { signal: undefined })
    expect(result).toEqual({ id: 2 })
  })
})
