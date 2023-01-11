import { useState, useEffect } from 'react';
import CharacterList from '../CharacterList';
import Search from '../Search/';
import Pagination from '../Pagination';
import Filter from '../Filter/';
import { getAllCharacters } from '../../services/getAllCharacters';
import './styles.css';

const CharacterListContainer = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            getAllCharacters(pageNumber, search)
                .then(data => setCharacters(data))
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 750)
    }, [pageNumber, search])

    const { info, results } = characters;

    return (
        <div className='main-container'>
            <h1>Characters</h1>
            <Search setSearch={setSearch} setPageNumber={setPageNumber} />
            <Pagination info={info} pageNumber={pageNumber} setPageNumber={setPageNumber} />
            {loading ? 'Loading...' : <CharacterList characters={results} />}
        </div>
    );
};

export default CharacterListContainer;