import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CharacterListContainer from './index'
import * as characterService from '../../services/getCharacters'

describe('CharacterListContainer — error rendering', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders ErrorState when the characters fetch fails', async () => {
    vi.spyOn(characterService, 'getAllCharacters').mockRejectedValue(
      new Error('network boom')
    )

    render(
      <MemoryRouter>
        <CharacterListContainer />
      </MemoryRouter>
    )

    // Fetch is debounced (350ms) then rejects — give waitFor room.
    await waitFor(
      () =>
        expect(
          screen.getByText('Could not load characters')
        ).toBeInTheDocument(),
      { timeout: 2000 }
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('CharacterListContainer — searching indicator lifecycle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the searching indicator during the debounce and clears it once results load', async () => {
    vi.spyOn(characterService, 'getAllCharacters').mockResolvedValue({
      info: { pages: 1 },
      results: [
        { id: 1, name: 'Rick Sanchez', species: 'Human', status: 'Alive', location: { name: 'Earth' }, image: 'rick.png' }
      ]
    })

    render(
      <MemoryRouter>
        <CharacterListContainer />
      </MemoryRouter>
    )

    expect(screen.getByText('Searching…')).toBeInTheDocument()

    await waitFor(
      () => expect(screen.getByText('Rick Sanchez')).toBeInTheDocument(),
      { timeout: 2000 }
    )

    expect(screen.queryByText('Searching…')).not.toBeInTheDocument()
  })

  it('clears the searching indicator even when the fetch fails, instead of leaving it stuck', async () => {
    vi.spyOn(characterService, 'getAllCharacters').mockRejectedValue(
      new Error('network boom')
    )

    render(
      <MemoryRouter>
        <CharacterListContainer />
      </MemoryRouter>
    )

    expect(screen.getByText('Searching…')).toBeInTheDocument()

    await waitFor(
      () => expect(screen.getByText('Could not load characters')).toBeInTheDocument(),
      { timeout: 2000 }
    )

    expect(screen.queryByText('Searching…')).not.toBeInTheDocument()
  })
})
