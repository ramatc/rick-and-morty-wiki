import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCharacterById } from '../../services/getCharacters'
import { useFavorites } from '../../hooks/useFavorites'
import Loader from '../Loader'
import ErrorState from '../ErrorState'
import './styles.css'

const CharacterDetail = () => {
  const { id } = useParams()
  const [character, setCharacter] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    getCharacterById(id, controller.signal)
      .then(res => setCharacter(res))
      .catch(err => { if (err.name !== 'AbortError') setError(err) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })

    return () => controller.abort()
  }, [id])

  const { name, location, origin, gender, image, status, species, episode } = character

  const favorite = isFavorite(character.id)

  if (loading) return <Loader />

  if (error) {
    return (
      <main className='main-container detail-character'>
        <ErrorState
          title={error.notFound ? 'Character not found' : 'Could not load character'}
          message={error.notFound
            ? "That character doesn't exist in this dimension."
            : 'Something went wrong. Please try again.'}
          action={<button onClick={() => navigate(-1)} className='btn-back'>Go back</button>}
        />
      </main>
    )
  }

  return (
    <main className='main-container detail-character'>
      <img src={image} alt={name} className='detail-image' />

      <div className='detail-info'>
        <div className='detail-heading'>
          <h1>{name} - <span className={`detail-status ${status}`}>{status}</span></h1>
          <button
            type='button'
            className='favorite-toggle favorite-toggle--detail'
            aria-pressed={favorite}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => toggleFavorite(character)}
          >
            <span aria-hidden='true'>{favorite ? '★' : '☆'}</span>
          </button>
        </div>
        <p><span>Species:</span> {species}</p>
        <p><span>Gender:</span> {gender}</p>
        <p><span>First seen in:</span> {origin?.name}</p>
        <p><span>Last known location:</span> {location?.name}</p>
        <p><span>Appears in:</span> {episode?.length} episode(s)</p>
        <button onClick={() => navigate(-1)} className='btn-back'>Go back</button>
      </div>
    </main>
  )
}

export default CharacterDetail
