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
