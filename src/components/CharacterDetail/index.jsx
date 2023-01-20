import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCharacterById } from '../../services/getCharacterById';

const CharacterDetail = () => {

    const { id } = useParams();
    const [character, setCharacter] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            getCharacterById(id)
                .then(res => setCharacter(res))
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 750);
    }, [id]);

    const { name, location, origin, gender, image, status, species } = character;

    return (
        <>
            {loading
                ? 'Loading...'
                : <div>
                    <h1>{name}</h1>
                    <img src={image} alt={name} />

                    <div>
                        <p>Gender: {gender}</p>
                        <p>Location: {location?.name}</p>
                        <p>Origin: {origin?.name}</p>
                        <p>Species: {species}</p>
                        <p>Origin: {origin?.name}</p>
                        <p>Status: {status}</p>
                    </div>
                </div>
            }
        </>
    )
}

export default CharacterDetail;