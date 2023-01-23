const Status = ({ setFilters, setPageNumber, status, gender, species }) => {

    const statusList = ['alive', 'dead', 'unknown'];

    return (
        <div className='filters-container'>
            <h3>Status:</h3>
            <div className='filter-btn-container'>
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
        </div>
    )
}

export default Status;