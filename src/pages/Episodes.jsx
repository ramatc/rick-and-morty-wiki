import { useEffect, useState } from 'react';
import Character from '../components/CharacterCard';
import InputGroup from '../components/Filter/category/InputGroup';
import Loader from '../components/Loader';
import { getEpisodeById, getEpisodeCount } from '../services/getEpisode';

const Episodes = () => {

    const [infoEpisode, setInfoEpisode] = useState([]);
    const [episodeCharacters, setEpisodeCharacters] = useState([]);
    const [id, setId] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            getEpisodeById(id)
                .then(res => { setInfoEpisode(res.data); setEpisodeCharacters(res.characters) })
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 750);
    }, [id]);

    getEpisodeCount()
        .then(res => setTotal(res))
        .catch(err => console.log(err));

    const { air_date, episode, name } = infoEpisode;

    return (
        <main className='main-container'>
            {
                loading
                    ? <Loader />
                    : <>
                        <div>
                            <h2>Episode name: <span>{name === '' ? 'Unknown' : name} - {episode}</span></h2>
                            <h4>Air Date: {air_date === '' ? 'Unknown' : air_date}</h4>
                        </div>

                        <div>
                            <div>
                                <h5>Pick Episode</h5>
                                <InputGroup name='Episode' setId={setId} total={total} />
                            </div>

                            <div>
                                <div className='characters-episodes'>
                                    {episodeCharacters.length > 0
                                        ? episodeCharacters.map(character => <Character {...character} key={character.id} />)
                                        : 'No Characters Found :('
                                    }
                                </div>
                            </div>
                        </div>
                    </>
            }
        </main>
    );
}

export default Episodes;