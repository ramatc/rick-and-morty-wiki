import { useState, useEffect } from 'react';
import CharacterList from '../CharacterList';
import Search from '../Search/';
import Pagination from '../Pagination';
import Filter from '../Filter';
import Loader from '../Loader';
import { getAllCharacters } from '../../services/getAllCharacters';
import './styles.css';

const CharacterListContainer = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [filters, setFilters] = useState({ status: '', gender: '', species: '' });
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            getAllCharacters(pageNumber, search, filters)
                .then(data => setCharacters(data))
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 750)
    }, [pageNumber, search, filters])

    const { info, results } = characters;

    return (
        <main className='main-container rows'>
            <div className='w-75'>
                <h1>Characters</h1>

                <Search
                    setSearch={setSearch}
                    setPageNumber={setPageNumber}
                />
                <Pagination
                    info={info}
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                />

                {loading ? <Loader /> : <CharacterList characters={results} />}
            </div>

            <div className='w-20'>
                <Filter
                    filters={filters}
                    setFilters={setFilters}
                    setPageNumber={setPageNumber}
                />
            </div>
        </main>
    );
};

export default CharacterListContainer;