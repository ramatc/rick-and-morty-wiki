const Species = ({ setFilters, setPageNumber, status, gender }) => {

    const species = ['Human', 'Alien', 'Humanoid', 'Poopybutthole', 'Mythological',
        'Unknown', 'Animal', 'Disease', 'Robot', 'Cronenberg', 'Planet'];

    return (
        <div className='filters-containers'>
            {species.map(specie =>
                <button
                    key={specie}
                    onClick={() => {
                        setFilters({ status: status, gender: gender, species: specie });
                        setPageNumber(1);
                    }}
                >
                    {specie}
                </button>
            )}
        </div>
    )
}

export default Species;