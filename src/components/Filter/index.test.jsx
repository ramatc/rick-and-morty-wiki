import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Filter from './index'
import { useMediaQuery } from '../../hooks/useMediaQuery'

vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn()
}))

const renderFilter = () => {
  const setFilters = vi.fn()
  const setPageNumber = vi.fn()
  render(
    <Filter
      filters={{ status: '', gender: '', species: '' }}
      setFilters={setFilters}
      setPageNumber={setPageNumber}
    />
  )
  return { setFilters, setPageNumber }
}

describe('Filter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('always shows the filter options on desktop with no disclosure toggle', () => {
    useMediaQuery.mockReturnValue(false)

    renderFilter()

    // Filter options render and are reachable (not hidden behind a collapse).
    expect(screen.getByRole('button', { name: 'alive' })).toBeVisible()
    // No collapse toggle exists on desktop — the panel is permanently expanded.
    expect(screen.queryByRole('button', { name: 'Filters' })).not.toBeInTheDocument()
  })

  it('renders an accessible disclosure button on mobile', () => {
    useMediaQuery.mockReturnValue(true)

    renderFilter()

    const toggle = screen.getByRole('button', { name: 'Filters' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls', 'filter-panel')
    expect(screen.getByRole('button', { name: 'alive' })).toBeVisible()
  })

  it('collapses and hides the panel when the mobile toggle is pressed', async () => {
    const user = userEvent.setup()
    useMediaQuery.mockReturnValue(true)

    renderFilter()

    const toggle = screen.getByRole('button', { name: 'Filters' })
    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // A hidden panel takes its option buttons out of the accessibility tree.
    expect(screen.queryByRole('button', { name: 'alive' })).not.toBeInTheDocument()
  })
})
