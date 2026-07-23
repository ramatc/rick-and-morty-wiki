import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
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
  })
})
