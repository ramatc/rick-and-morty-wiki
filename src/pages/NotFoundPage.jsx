import { useNavigate } from 'react-router-dom'
import ErrorState from '../components/ErrorState'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <main className='main-container'>
      <ErrorState
        title='404 — Lost in the multiverse'
        message="This page doesn't exist in any known dimension."
        action={<button onClick={() => navigate('/')} className='btn-back'>Back to characters</button>}
      />
    </main>
  )
}

export default NotFoundPage
