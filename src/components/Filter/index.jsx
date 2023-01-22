import Status from './category/Status';
import Gender from './category/Gender';
import Species from './category/Species';
import './styles.css';

const Filter = ({ filters, setFilters, setPageNumber }) => {

    const handleClear = () => {
        setFilters({ status: '', gender: '', species: '' });
        setPageNumber(1);
    }

    return (
        <>
            <h2>Filters</h2>

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
        </>
    )
}

export default Filter;