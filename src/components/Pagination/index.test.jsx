import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Pagination from './index'

describe('Pagination', () => {
  it('renders nothing until page info is available', () => {
    const { container } = render(
      <Pagination info={undefined} pageNumber={1} setPageNumber={vi.fn()} />
    )

    expect(container.querySelector('.pagination')).toBeNull()
  })

  it('marks the current page with aria-current and a descriptive label', () => {
    render(<Pagination info={{ pages: 5 }} pageNumber={3} setPageNumber={vi.fn()} />)

    const current = screen.getByRole('button', { name: /page 3, current page/i })
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('labels non-current pages as navigable', () => {
    render(<Pagination info={{ pages: 5 }} pageNumber={1} setPageNumber={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /page 1, current page/i })
    ).toHaveAttribute('aria-current', 'page')
  })
})
