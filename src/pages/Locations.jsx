import { useEffect, useState } from 'react';
import Character from '../components/CharacterCard';
import InputGroup from '../components/Filter/category/InputGroup';
import Loader from '../components/Loader';
import NotFound from '../components/NotFound';
import { getLocationById, getLocationCount } from '../services/getLocation';

const Locations = () => {

    const [infoLocation, setInfoLocation] = useState([]);
    const [locationCharacters, setLocationCharacters] = useState([]);
    const [number, setNumber] = useState(1);
    const [total, setTotal] = useState(0);
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

    getLocationCount()
        .then(res => setTotal(res))
        .catch(err => console.log(err));

    const { dimension, type, name } = infoLocation;

    return (
        <main className='main-container'>
            {
                loading
                    ? <Loader />
                    : <>
                        <div className='page-container'>
                            <div className='info-container'>
                                <h2>Location: <span>{name === '' ? 'Unknown' : name}</span></h2>
                                <h3>Dimension: <span>{dimension === '' ? 'Unknown' : dimension}</span></h3>
                                <h3>Type: <span>{type === '' ? 'Unknown' : type}</span></h3>
                            </div>

                            <div className='pick-container'>
                                <p>Pick Location:</p>
                                <InputGroup name='Location' setId={setNumber} total={total} />
                            </div>
                        </div>

                        {
                            locationCharacters.length > 0
                                ? <div className='characters'>
                                    {locationCharacters.map(character => <Character {...character} key={character.id} />)}
                                </div>
                                : <NotFound />
                        }
                    </>
            }
        </main>
    );
}

export default Locations;