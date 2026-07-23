import { useEffect, useState } from 'react';
import Character from '../components/CharacterCard';
import InputGroup from '../components/Filter/category/InputGroup';
import Loader from '../components/Loader';
import NotFound from '../components/NotFound';
import ErrorState from '../components/ErrorState';
import { getLocationById, getLocationCount } from '../services/getLocation';

const Locations = () => {

    const [infoLocation, setInfoLocation] = useState([]);
    const [locationCharacters, setLocationCharacters] = useState([]);
    const [number, setNumber] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the total location count once on mount — it never changes during
    // the page's lifetime, so it belongs in an empty-dependency effect.
    useEffect(() => {
        const controller = new AbortController();

        getLocationCount(controller.signal)
            .then(res => setTotal(res))
            .catch(err => { if (err.name !== 'AbortError') setError(err); });

        return () => controller.abort();
    }, []);

    // Fetch the selected location whenever the picked number changes.
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getLocationById(number, controller.signal)
            .then(res => { setInfoLocation(res.data); setLocationCharacters(res.residents); })
            .catch(err => { if (err.name !== 'AbortError') setError(err); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [number]);

    const { dimension, type, name } = infoLocation;

    return (
        <main className='main-container'>
            {
                loading
                    ? <Loader />
                    : error
                        ? <ErrorState
                            title='Could not load location'
                            message='Something went wrong while reaching this dimension. Please try again.'
                        />
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
