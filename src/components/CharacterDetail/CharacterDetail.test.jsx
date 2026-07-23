import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CharacterDetail from './index'
import * as characterService from '../../services/getCharacters'

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={['/character/1']}>
      <Routes>
        <Route path='/character/:id' element={<CharacterDetail />} />
      </Routes>
    </MemoryRouter>
  )

describe('CharacterDetail — error rendering', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the generic ErrorState when the fetch fails without notFound', async () => {
    vi.spyOn(characterService, 'getCharacterById').mockRejectedValue(
      new Error('network boom')
    )

    renderDetail()

    await waitFor(() =>
      expect(screen.getByText('Could not load character')).toBeInTheDocument()
    )
    expect(
      screen.getByText(/Something went wrong\. Please try again\./)
    ).toBeInTheDocument()
    // Must NOT show the not-found copy for a generic failure.
    expect(screen.queryByText('Character not found')).not.toBeInTheDocument()
  })

  it('renders the not-found ErrorState when the fetch fails with notFound', async () => {
    const notFoundError = Object.assign(new Error('Request failed: 404'), {
      name: 'ApiError',
      status: 404,
      notFound: true,
    })
    vi.spyOn(characterService, 'getCharacterById').mockRejectedValue(
      notFoundError
    )

    renderDetail()

    await waitFor(() =>
      expect(screen.getByText('Character not found')).toBeInTheDocument()
    )
    expect(
      screen.getByText(/doesn't exist in this dimension/)
    ).toBeInTheDocument()
    // Must NOT show the generic copy for a 404 failure.
    expect(
      screen.queryByText('Could not load character')
    ).not.toBeInTheDocument()
  })
})
