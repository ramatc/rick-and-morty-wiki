import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCharacterById } from '../../services/getCharacters';
import Loader from '../Loader';
import ErrorState from '../ErrorState';
import './styles.css';

const CharacterDetail = () => {

    const { id } = useParams();
    const [character, setCharacter] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getCharacterById(id, controller.signal)
            .then(res => setCharacter(res))
            .catch(err => { if (err.name !== 'AbortError') setError(err); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [id]);

    const { name, location, origin, gender, image, status, species, episode } = character;

    if (loading) return <Loader />;

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
        );
    }

    return (
        <main className='main-container detail-character'>
            <img src={image} alt={name} className='detail-image' />

            <div className='detail-info'>
                <h1>{name} - <span className={`detail-status ${status}`}>{status}</span></h1>
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

export default CharacterDetail;
