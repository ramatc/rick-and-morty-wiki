import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Locations from './Locations'
import * as locationService from '../services/getLocation'

describe('Locations page — fetch-in-render regression', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls getLocationCount exactly once on mount, even after state updates', async () => {
    const countSpy = vi
      .spyOn(locationService, 'getLocationCount')
      .mockResolvedValue(126)

    vi.spyOn(locationService, 'getLocationById').mockResolvedValue({
      data: { name: 'Earth (C-137)', dimension: 'Dimension C-137', type: 'Planet' },
      residents: []
    })

    render(
      <MemoryRouter>
        <Locations />
      </MemoryRouter>
    )

    await waitFor(() => expect(countSpy).toHaveBeenCalled())
    await waitFor(() => expect(locationService.getLocationById).toHaveBeenCalled())

    expect(countSpy).toHaveBeenCalledTimes(1)

    // A refactor that preserves call count but breaks rendering must fail here:
    // assert the fetched location actually reaches the DOM.
    await waitFor(() =>
      expect(screen.getByText(/Earth \(C-137\)/)).toBeInTheDocument()
    )
    expect(screen.getByText(/Dimension C-137/)).toBeInTheDocument()
  })

  it('renders ErrorState when the count fetch fails', async () => {
    vi.spyOn(locationService, 'getLocationCount').mockRejectedValue(
      new Error('count boom')
    )

    // Item fetch resolves so `loading` clears — isolating the count failure.
    vi.spyOn(locationService, 'getLocationById').mockResolvedValue({
      data: { name: 'Earth (C-137)', dimension: 'Dimension C-137', type: 'Planet' },
      residents: []
    })

    render(
      <MemoryRouter>
        <Locations />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText('Could not load location')).toBeInTheDocument()
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
