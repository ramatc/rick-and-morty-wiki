import { useEffect, useState } from 'react';
import Character from '../components/CharacterCard';
import InputGroup from '../components/Filter/category/InputGroup';
import { getLocationById } from '../services/getLocationById';

const Locations = () => {

    const [infoLocation, setInfoLocation] = useState([]);
    const [locationCharacters, setLocationCharacters] = useState([]);
    const [number, setNumber] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            getLocationById(number)
                .then(res => { setInfoLocation(res.data); setLocationCharacters(res.residents) })
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 750);
    }, [number]);

    const { dimension, type, name } = infoLocation;

    return (
        <div>
            <div>
                <h2>Location: <span>{name === '' ? 'Unknown' : name}</span></h2>
                <h5>Dimension: {dimension === '' ? 'Unknown' : dimension}</h5>
                <h6>Type: {type === '' ? 'Unknown' : type}</h6>
            </div>

            <div>
                <div>
                    <h5>Pick Location</h5>
                    {/* TOTAL HARDCODEADO Y LOADING */}
                    <InputGroup name='Location' setId={setNumber} total={126} />
                </div>

                <div>
                    <div className='characters-episodes'>
                        {locationCharacters
                            ? locationCharacters.map(character => <Character {...character} key={character.id} />)
                            : 'No Characters Found :('
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Locations;