const FilterCategory = ({ title, filterKey, values, filters, setFilters, setPageNumber }) => {

    return (
        <div className='filters-container'>
            <h3>{title}:</h3>
            <div className='filter-btn-container'>
                {values.map(value =>
                    <button
                        key={value}
                        onClick={() => {
                            setFilters({ ...filters, [filterKey]: value });
                            setPageNumber(1);
                        }}
                        aria-pressed={value === filters[filterKey]}
                        className={value === filters[filterKey] ? 'active-filter' : ''}
                    >
                        {value}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FilterCategory;
