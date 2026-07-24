import './styles.css';

const Search = ({ setSearch, setPageNumber }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <form role='search' onSubmit={handleSubmit}>
            <label htmlFor='character-search' className='visually-hidden'>Search for characters</label>
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
        </form>
    )
}

export default Search;
