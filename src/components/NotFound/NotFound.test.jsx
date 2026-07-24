import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from './index'

describe('NotFound', () => {
  it('renders a generic empty message by default', () => {
    render(<NotFound />)

    expect(screen.getAllByText(/no characters found/i).length).toBeGreaterThan(0)
  })

  it('renders a context-aware message when one is provided', () => {
    render(<NotFound message='No characters match your search' />)

    expect(
      screen.getAllByText(/no characters match your search/i).length
    ).toBeGreaterThan(0)
  })
})
