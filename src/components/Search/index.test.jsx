import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Search from './index'

describe('Search', () => {
  it('exposes a search landmark and an accessible search input', () => {
    render(<Search setSearch={vi.fn()} setPageNumber={vi.fn()} />)

    expect(screen.getByRole('search')).toBeInTheDocument()

    const input = screen.getByRole('searchbox', { name: /search for characters/i })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveAttribute('id')
  })

  it('updates the search term and resets to page 1 as the user types', async () => {
    const user = userEvent.setup()
    const setSearch = vi.fn()
    const setPageNumber = vi.fn()
    render(<Search setSearch={setSearch} setPageNumber={setPageNumber} />)

    await user.type(screen.getByRole('searchbox'), 'rick')

    expect(setSearch).toHaveBeenLastCalledWith('rick')
    expect(setPageNumber).toHaveBeenLastCalledWith(1)
  })
})
