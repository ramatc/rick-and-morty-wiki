import { useEffect, useState } from 'react';
import Character from '../components/CharacterCard';
import InputGroup from '../components/Filter/category/InputGroup';
import { getEpisodeById } from '../services/getEpisodeById';

const Episodes = () => {

    const [infoEpisode, setInfoEpisode] = useState([]);
    const [episodeCharacters, setEpisodeCharacters] = useState([]);
    const [id, setId] = useState(1);
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

    const { air_date, episode, name } = infoEpisode;

    return (
        <div>
            <div>
                <h2>Episode name: <span>{name === '' ? 'Unknown' : name} - {episode}</span></h2>
                <h4>Air Date: {air_date === '' ? 'Unknown' : air_date}</h4>
            </div>

            <div>
                <div>
                    <h5>Pick Episode</h5>
                    {/* TOTAL HARDCODEADO Y LOADING */}
                    <InputGroup name='Episode' setId={setId} total={51} />
                </div>

                <div>
                    <div className='characters-episodes'>
                        {episodeCharacters
                            ? episodeCharacters.map(character => <Character {...character} key={character.id} />)
                            : 'No Characters Found :('
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Episodes;