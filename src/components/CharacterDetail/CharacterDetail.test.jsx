import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      notFound: true
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

describe('CharacterDetail — favorite toggle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  const character = {
    id: 1,
    name: 'Rick Sanchez',
    image: 'rick.png',
    species: 'Human',
    status: 'Alive',
    gender: 'Male',
    origin: { name: 'Earth (C-137)' },
    location: { name: 'Citadel of Ricks' },
    episode: ['ep-1']
  }

  it('toggles the character as a favorite from the detail view', async () => {
    const user = userEvent.setup()
    vi.spyOn(characterService, 'getCharacterById').mockResolvedValue(character)

    renderDetail()

    // Wait for the loaded detail before the toggle exists.
    const toggle = await screen.findByRole('button', { name: 'Add to favorites' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)

    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
