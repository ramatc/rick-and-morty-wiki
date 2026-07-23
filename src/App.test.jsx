import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App routing — catch-all 404', () => {
  it('renders NotFoundPage for an unmatched path via the path="*" route', () => {
    // App uses BrowserRouter, so drive the route through window.history.
    window.history.pushState({}, '', '/this-does-not-exist')

    render(<App />)

    expect(
      screen.getByText('404 — Lost in the multiverse')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/This page doesn't exist in any known dimension/)
    ).toBeInTheDocument()
  })
})
