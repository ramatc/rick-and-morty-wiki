import Status from './category/Status';
import Gender from './category/Gender';
import Species from './category/Species';

const Filter = ({ pageNumber, filters, setFilters, setPageNumber }) => {

    const handleClear = () => {
        setFilters({ status: '', gender: '', species: '' });
        setPageNumber(1);
    }

    const { status, gender, species } = filters;

    return (
        <>
            <h2>Filter</h2>

            <p onClick={handleClear}>Clear filters</p>

            <div>
                <Status
                    setFilters={setFilters}
                    setPageNumber={setPageNumber}
                />
            </div>
        </>
    )
}

export default Filter;