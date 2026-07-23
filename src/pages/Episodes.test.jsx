import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Episodes from './Episodes'
import * as episodeService from '../services/getEpisode'

describe('Episodes page — fetch-in-render regression', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls getEpisodeCount exactly once on mount, even after state updates', async () => {
    const countSpy = vi
      .spyOn(episodeService, 'getEpisodeCount')
      .mockResolvedValue(51)

    vi.spyOn(episodeService, 'getEpisodeById').mockResolvedValue({
      data: { name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' },
      characters: [],
    })

    render(
      <MemoryRouter>
        <Episodes />
      </MemoryRouter>
    )

    // Both the count fetch and the item fetch resolve, causing re-renders.
    await waitFor(() => expect(countSpy).toHaveBeenCalled())
    await waitFor(() => expect(episodeService.getEpisodeById).toHaveBeenCalled())

    // The count must NOT be re-fetched on every render (the old bug).
    expect(countSpy).toHaveBeenCalledTimes(1)

    // A refactor that preserves call count but breaks rendering must fail here:
    // assert the fetched episode actually reaches the DOM.
    await waitFor(() =>
      expect(screen.getByText(/Pilot/)).toBeInTheDocument()
    )
    expect(screen.getByText(/S01E01/)).toBeInTheDocument()
  })

  it('renders ErrorState when the count fetch fails', async () => {
    vi.spyOn(episodeService, 'getEpisodeCount').mockRejectedValue(
      new Error('count boom')
    )

    // Item fetch resolves so `loading` clears — isolating the count failure.
    vi.spyOn(episodeService, 'getEpisodeById').mockResolvedValue({
      data: { name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' },
      characters: [],
    })

    render(
      <MemoryRouter>
        <Episodes />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText('Could not load episode')).toBeInTheDocument()
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
