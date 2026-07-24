import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Favorites from './Favorites'

const STORAGE_KEY = 'ramw:favorites:v1'

const renderPage = () =>
  render(
    <MemoryRouter>
      <Favorites />
    </MemoryRouter>
  )

describe('Favorites page', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty-state message when there are no favorites', () => {
    renderPage()

    expect(screen.getAllByText('No favorites yet').length).toBeGreaterThan(0)
  })

  it('renders a card for each stored favorite snapshot (no network)', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: 1, name: 'Rick Sanchez', image: 'rick.png', species: 'Human', status: 'Alive', location: { name: 'Earth (C-137)' } },
        { id: 2, name: 'Morty Smith', image: 'morty.png', species: 'Human', status: 'Alive', location: { name: 'Earth' } }
      ])
    )

    renderPage()

    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    expect(screen.getByText('Morty Smith')).toBeInTheDocument()
    expect(screen.queryByText('No favorites yet')).not.toBeInTheDocument()
  })
})
