import { useState } from 'react';
import FilterCategory from './category/FilterCategory';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './styles.css';

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

    const isMobile = useMediaQuery('(max-width: 768px)');
    const [collapsed, setCollapsed] = useState(false);

    const handleClear = () => {
        setFilters({ status: '', gender: '', species: '' });
        setPageNumber(1);
    }

    return (
        <>
            {isMobile
                ? <button
                    type='button'
                    className='filter-title'
                    aria-expanded={!collapsed}
                    aria-controls='filter-panel'
                    onClick={() => setCollapsed(current => !current)}
                >
                    Filters
                    <span aria-hidden='true'>{collapsed ? ' ▾' : ' ▴'}</span>
                </button>
                : <h2 className='filter-title'>Filters</h2>
            }

            <div id='filter-panel' hidden={isMobile && collapsed}>
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
