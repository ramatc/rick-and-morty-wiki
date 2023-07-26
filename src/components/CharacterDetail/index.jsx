import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCharacterById } from '../../services/getCharacters';
import Loader from '../Loader';
import './styles.css';

const CharacterDetail = () => {

    const { id } = useParams();
    const [character, setCharacter] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    
    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            getCharacterById(id)
                .then(res => setCharacter(res))
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 750);
    }, [id]);

    const { name, location, origin, gender, image, status, species, episode } = character;

    return (
        <>
            {loading
                ? <Loader />
                : <main className='main-container detail-character'>
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
            }
        </>
    )
}

export default CharacterDetail;