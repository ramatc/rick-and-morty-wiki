import './styles.css';

const Search = ({ setSearch, setPageNumber, searching = false }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <form role='search' onSubmit={handleSubmit}>
            <label htmlFor='character-search' className='sr-only'>Search for characters</label>
            <input
                id='character-search'
                name='q'
                type='search'
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                }}
                placeholder='Search for characters'
            />
            <span
                className='search-indicator'
                role='status'
                aria-live='polite'
                hidden={!searching}
            >
                {searching ? 'Searching…' : ''}
            </span>
        </form>
    )
}

export default Search;
