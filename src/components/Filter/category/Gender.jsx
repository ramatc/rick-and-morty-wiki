const Gender = ({ setFilters, setPageNumber, status, gender, species }) => {

    const gendersList = ['female', 'male', 'genderless', 'unknown'];

    return (
        <div className='filters-container'>
            <h3>Gender:</h3>
            <div className='filter-btn-container'>
                {gendersList.map(genderItem =>
                    <button
                        key={genderItem}
                        onClick={() => {
                            setFilters({ status: status, gender: genderItem, species: species });
                            setPageNumber(1);
                        }}
                        className={genderItem === gender ? 'active-filter' : ''}
                    >
                        {genderItem}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Gender;