import { useState, useEffect, useCallback } from 'react';
import debounce from 'just-debounce-it';
import CharacterList from '../CharacterList';
import Search from '../Search/';
import Pagination from '../Pagination';
import Filter from '../Filter';
import Loader from '../Loader';
import ErrorState from '../ErrorState';
import { getAllCharacters } from '../../services/getCharacters';
import './styles.css';

const CharacterListContainer = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [filters, setFilters] = useState({ status: '', gender: '', species: '' });
    const [search, setSearch] = useState('');

    const debouncedGetMovies = useCallback(
        debounce((pageNumber, search, filters, signal) => {
            getAllCharacters(pageNumber, search, filters, signal)
                .then(data => { setCharacters(data); setError(null); })
                .catch(err => { if (err.name !== 'AbortError') setError(err); })
                .finally(() => { if (!signal.aborted) setLoading(false); });
        }, 350)
        , []);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        debouncedGetMovies(pageNumber, search, filters, controller.signal);

        return () => {
            controller.abort();
            if (debouncedGetMovies.cancel) debouncedGetMovies.cancel();
        };
    }, [pageNumber, search, filters, debouncedGetMovies])

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
                    : error
                        ? <ErrorState
                            title='Could not load characters'
                            message='Something went wrong while reaching this dimension. Please try again.'
                        />
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
