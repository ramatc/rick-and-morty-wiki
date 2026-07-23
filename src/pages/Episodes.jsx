import { useEffect, useState } from 'react';
import Character from '../components/CharacterCard';
import InputGroup from '../components/Filter/category/InputGroup';
import Loader from '../components/Loader';
import NotFound from '../components/NotFound';
import ErrorState from '../components/ErrorState';
import { getEpisodeById, getEpisodeCount } from '../services/getEpisode';

const Episodes = () => {

    const [infoEpisode, setInfoEpisode] = useState([]);
    const [episodeCharacters, setEpisodeCharacters] = useState([]);
    const [id, setId] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the total episode count once on mount — it never changes during
    // the page's lifetime, so it belongs in an empty-dependency effect.
    useEffect(() => {
        const controller = new AbortController();

        getEpisodeCount(controller.signal)
            .then(res => setTotal(res))
            .catch(err => { if (err.name !== 'AbortError') console.error(err); });

        return () => controller.abort();
    }, []);

    // Fetch the selected episode whenever the picked id changes.
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        getEpisodeById(id, controller.signal)
            .then(res => { setInfoEpisode(res.data); setEpisodeCharacters(res.characters); })
            .catch(err => { if (err.name !== 'AbortError') setError(err); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });

        return () => controller.abort();
    }, [id]);

    const { air_date, episode, name } = infoEpisode;

    return (
        <main className='main-container'>
            {
                loading
                    ? <Loader />
                    : error
                        ? <ErrorState
                            title='Could not load episode'
                            message='Something went wrong while reaching this dimension. Please try again.'
                        />
                        : <>
                            <div className='page-container'>
                                <div className='info-container'>
                                    <h2>Episode name: <span>{name === '' ? 'Unknown' : name} - {episode}</span></h2>
                                    <h3>Air Date: <span>{air_date === '' ? 'Unknown' : air_date}</span></h3>
                                </div>

                                <div className='pick-container'>
                                    <p>Pick Episode:</p>
                                    <InputGroup name='Episode' setId={setId} total={total} />
                                </div>
                            </div>

                            {
                                episodeCharacters.length > 0
                                    ? <div className='characters'>
                                        {episodeCharacters.map(character => <Character {...character} key={character.id} />)}
                                    </div>
                                    : <NotFound />
                            }
                        </>
            }
        </main>
    );
}

export default Episodes;
