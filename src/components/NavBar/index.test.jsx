import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from './index'

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>
  )

describe('NavBar', () => {
  it('exposes a labelled main navigation landmark', () => {
    renderAt('/')

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('marks only the active route with aria-current=page', () => {
    renderAt('/episodes')

    expect(screen.getByRole('link', { name: 'Episodes' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Characters' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('links to the favorites page', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: 'Favorites' })).toHaveAttribute(
      'href',
      '/favorites'
    )
  })
})
