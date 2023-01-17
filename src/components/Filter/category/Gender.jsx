const Gender = ({ setFilters, setPageNumber, status, species }) => {

    const genders = ['female', 'male', 'genderless', 'unknown'];

    return (
        <div className='filters-containers'>
            {genders.map(gender =>
                <button
                    key={gender}
                    onClick={() => {
                        setFilters({ status: status, gender: gender, species: species });
                        setPageNumber(1);
                    }}
                >
                    {gender}
                </button>
            )}
        </div>
    )
}

export default Gender;