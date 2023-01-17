const Status = ({ setFilters, setPageNumber, status, gender, species }) => {

    const statusList = ['alive', 'dead', 'unknown'];

    return (
        <div className='filters-containers'>
            {statusList.map(stat =>
                <button
                    key={stat}
                    onClick={() => {
                        setFilters({ status: stat, gender: gender, species: species });
                        setPageNumber(1);
                    }}
                    className={stat === status ? 'active-filter' : ''}
                >
                    {stat}
                </button>
            )}
        </div>
    )
}

export default Status;