import { useState } from 'react';
import Status from './category/Status';
import Gender from './category/Gender';
import Species from './category/Species';
import './styles.css';

const matchMedia = window.matchMedia('(max-width: 768px)').matches;

const Filter = ({ filters, setFilters, setPageNumber }) => {

    const [display, setDisplay] = useState(true);

    const handleClear = () => {
        setFilters({ status: '', gender: '', species: '' });
        setPageNumber(1);
    }

    return (
        <>
            <h2
                className='filter-title'
                onClick={matchMedia ? () => setDisplay(!display) : () => setDisplay(display)}
            >
                Filters
                {
                    matchMedia && <img src={display ? 'https://icongr.am/fontawesome/arrow-down.svg?size=20&color=ffffff' : 'https://icongr.am/fontawesome/arrow-up.svg?size=20&color=ffffff'} />
                }
            </h2>

            <div className={matchMedia && display ? 'd-none' : ''}>
                <div className='filters'>
                    <Status
                        setFilters={setFilters}
                        setPageNumber={setPageNumber}
                        {...filters}
                    />
                    <Gender
                        setFilters={setFilters}
                        setPageNumber={setPageNumber}
                        {...filters}
                    />
                    <Species
                        setFilters={setFilters}
                        setPageNumber={setPageNumber}
                        {...filters}
                    />
                </div>

                <button
                    onClick={handleClear}
                    className='btn-clear'
                >
                    Clear filters
                </button>
            </div>
        </>
    )
}

export default Filter;