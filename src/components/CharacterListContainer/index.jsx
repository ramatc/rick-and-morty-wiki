import { useState, useEffect, useCallback } from 'react';
import debounce from 'just-debounce-it';
import CharacterList from '../CharacterList';
import Search from '../Search/';
import Pagination from '../Pagination';
import Filter from '../Filter';
import Loader from '../Loader';
import { getAllCharacters } from '../../services/getCharacters';
import './styles.css';

const CharacterListContainer = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [filters, setFilters] = useState({ status: '', gender: '', species: '' });
    const [search, setSearch] = useState('');

    const debouncedGetMovies = useCallback(
        debounce((pageNumber, search, filters) => {
            getAllCharacters(pageNumber, search, filters)
                .then(data => setCharacters(data))
                .catch(err => console.log(err))
                .finally(() => setLoading(false));
        }, 350)
        , []);

    useEffect(() => {
        setLoading(true);

        debouncedGetMovies(pageNumber, search, filters);

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

                {loading
                    ? <Loader />
                    : <>
                        <CharacterList characters={results} />
                        <Pagination
                            info={info}
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                        />
                    </>
                }
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