import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CharacterCard from './index'

const baseCharacter = {
  id: 1,
  name: 'Rick Sanchez',
  image: 'rick.png',
  species: 'Human',
  status: 'Alive',
  location: { name: 'Earth (C-137)' },
}

// The card is a <Link>; render it behind a router with a real detail route so
// a test can PROVE whether a click navigated or not.
const renderCard = (overrides = {}) => {
  const character = { ...baseCharacter, ...overrides }
  return {
    character,
    ...render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<CharacterCard {...character} />} />
          <Route path='/character/:id' element={<div>Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    ),
  }
}

describe('CharacterCard — favorite toggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders an unpressed favorite toggle by default', () => {
    renderCard()

    const toggle = screen.getByRole('button', { name: 'Add to favorites' })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('adds the character to favorites when the star is clicked', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }))

    const toggle = screen.getByRole('button', { name: 'Remove from favorites' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('removes the character from favorites when toggled twice', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }))
    await user.click(screen.getByRole('button', { name: 'Remove from favorites' }))

    expect(
      screen.getByRole('button', { name: 'Add to favorites' })
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('persists the favorite so a remounted card shows it as favorited', async () => {
    const user = userEvent.setup()
    const { unmount } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }))
    unmount()

    renderCard()

    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).toBeInTheDocument()
  })

  it('does NOT navigate to the detail route when the star is clicked', async () => {
    const user = userEvent.setup()
    renderCard()

    expect(screen.queryByText('Detail Page')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }))

    // preventDefault + stopPropagation must have blocked <Link> navigation.
    expect(screen.queryByText('Detail Page')).not.toBeInTheDocument()
    // ...and the favorite still toggled.
    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).toBeInTheDocument()
  })

  it('DOES navigate to the detail route when the card body is clicked', async () => {
    // Positive control: proves the router setup can detect navigation, so the
    // no-navigate assertion above is meaningful and not a ghost.
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByText('Rick Sanchez'))

    expect(screen.getByText('Detail Page')).toBeInTheDocument()
  })
})
