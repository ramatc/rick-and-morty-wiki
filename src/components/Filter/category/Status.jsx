const Status = ({ setFilters, setPageNumber, gender, species }) => {

    const status = ['alive', 'dead', 'unknown'];

    return (
        <div className='filters-containers'>
            {status.map(stat =>
                <button
                    key={stat}
                    onClick={() => {
                        setFilters({ status: stat, gender: gender, species: species });
                        setPageNumber(1);
                    }}
                >
                    {stat}
                </button>
            )}
        </div>
    )
}

export default Status;