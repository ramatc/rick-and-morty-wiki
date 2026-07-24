import './styles.css';

const Search = ({ setSearch, setPageNumber }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <form role='search' onSubmit={handleSubmit}>
            <input
                id='character-search'
                name='q'
                type='search'
                aria-label='Search for characters'
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
