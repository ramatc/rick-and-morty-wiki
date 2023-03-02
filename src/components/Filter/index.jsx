import { useState } from 'react';
import Status from './category/Status';
import Gender from './category/Gender';
import Species from './category/Species';
import './styles.css';

const Filter = ({ filters, setFilters, setPageNumber }) => {

    const [display, setDisplay] = useState(false);

    const handleClear = () => {
        setFilters({ status: '', gender: '', species: '' });
        setPageNumber(1);
    }

    return (
        <>
            <h2
                className='filter-title'
                onClick={() => setDisplay(!display)}
            >
                Filters
                <img src='https://icongr.am/fontawesome/arrow-down.svg?size=20&color=ffffff' />
            </h2>

            <div>
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