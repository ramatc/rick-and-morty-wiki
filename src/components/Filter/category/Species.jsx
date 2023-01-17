const Species = ({ setFilters, setPageNumber, status, gender, species }) => {

    const speciesList = ['Human', 'Alien', 'Humanoid', 'Poopybutthole', 'Mythological',
        'Unknown', 'Animal', 'Disease', 'Robot', 'Cronenberg', 'Planet'];

    return (
        <div className='filters-containers'>
            {speciesList.map(specie =>
                <button
                    key={specie}
                    onClick={() => {
                        setFilters({ status: status, gender: gender, species: specie });
                        setPageNumber(1);
                    }}
                    className={specie === species ? 'active-filter' : ''}
                >
                    {specie}
                </button>
            )}
        </div>
    )
}

export default Species;