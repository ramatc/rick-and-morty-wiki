import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
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
      residents: [],
    })

    render(
      <MemoryRouter>
        <Locations />
      </MemoryRouter>
    )

    await waitFor(() => expect(countSpy).toHaveBeenCalled())
    await waitFor(() => expect(locationService.getLocationById).toHaveBeenCalled())

    expect(countSpy).toHaveBeenCalledTimes(1)
  })
})
