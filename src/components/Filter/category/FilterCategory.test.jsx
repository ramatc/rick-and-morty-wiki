import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterCategory from './FilterCategory'

const renderCategory = (overrides = {}) => {
  const setFilters = vi.fn()
  const setPageNumber = vi.fn()
  const props = {
    title: 'Status',
    filterKey: 'status',
    values: ['alive', 'dead', 'unknown'],
    filters: { status: '', gender: '', species: '' },
    setFilters,
    setPageNumber,
    ...overrides
  }
  render(<FilterCategory {...props} />)
  return { setFilters, setPageNumber, props }
}

describe('FilterCategory', () => {
  it('renders the title and one button per value', () => {
    renderCategory()

    expect(screen.getByRole('heading', { name: 'Status:' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'alive' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'dead' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'unknown' })).toBeInTheDocument()
  })

  it('sets the correct filter key and resets to page 1 on click', async () => {
    const user = userEvent.setup()
    const { setFilters, setPageNumber } = renderCategory({
      filters: { status: '', gender: 'male', species: 'Human' }
    })

    await user.click(screen.getByRole('button', { name: 'dead' }))

    // Preserves other filters, overwrites only its own key (computed-key merge).
    expect(setFilters).toHaveBeenCalledWith({
      status: 'dead',
      gender: 'male',
      species: 'Human'
    })
    expect(setPageNumber).toHaveBeenCalledWith(1)
  })

  it('reflects the selected value with aria-pressed', () => {
    renderCategory({ filters: { status: 'alive', gender: '', species: '' } })

    expect(screen.getByRole('button', { name: 'alive' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'dead' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'unknown' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('applies the active-filter class only to the selected value', () => {
    renderCategory({ filters: { status: 'alive', gender: '', species: '' } })

    expect(screen.getByRole('button', { name: 'alive' })).toHaveClass('active-filter')
    expect(screen.getByRole('button', { name: 'dead' })).not.toHaveClass('active-filter')
    expect(screen.getByRole('button', { name: 'unknown' })).not.toHaveClass('active-filter')
  })

  it('drives a different category (gender) purely from props', async () => {
    const user = userEvent.setup()
    const { setFilters, setPageNumber } = renderCategory({
      title: 'Gender',
      filterKey: 'gender',
      values: ['female', 'male', 'genderless', 'unknown'],
      filters: { status: 'alive', gender: '', species: '' }
    })

    await user.click(screen.getByRole('button', { name: 'female' }))

    expect(setFilters).toHaveBeenCalledWith({
      status: 'alive',
      gender: 'female',
      species: ''
    })
    expect(setPageNumber).toHaveBeenCalledWith(1)
  })
})
