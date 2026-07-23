import { useState } from 'react';
import FilterCategory from './category/FilterCategory';
import './styles.css';

const matchMedia = window.matchMedia('(max-width: 768px)').matches;

const CATEGORIES = [
    { title: 'Status', filterKey: 'status', values: ['alive', 'dead', 'unknown'] },
    { title: 'Gender', filterKey: 'gender', values: ['female', 'male', 'genderless', 'unknown'] },
    {
        title: 'Species',
        filterKey: 'species',
        values: ['Human', 'Alien', 'Humanoid', 'Poopybutthole', 'Mythological',
            'Unknown', 'Animal', 'Disease', 'Robot', 'Cronenberg', 'Planet'],
    },
];

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
                    {CATEGORIES.map(category =>
                        <FilterCategory
                            key={category.filterKey}
                            {...category}
                            filters={filters}
                            setFilters={setFilters}
                            setPageNumber={setPageNumber}
                        />
                    )}
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