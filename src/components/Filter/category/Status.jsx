const Status = ({ setFilters, setPageNumber }) => {

    const status = ['alive', 'dead', 'unknown'];

    return (
        <>
            {status.map(stat =>
                <button
                    key={stat}
                    onClick={() => setFilters({ status: stat, gender: '', species: '' })}
                >
                    {stat}
                </button>
            )}
        </>
    )
}

export default Status;