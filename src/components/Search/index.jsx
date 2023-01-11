import './styles.css';

const Search = ({ setSearch, setPageNumber }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                }}
                placeholder='Search for characters'
                type='text'
            />
        </form>
    )
}

export default Search;