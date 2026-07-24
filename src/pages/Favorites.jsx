import CharacterList from '../components/CharacterList';
import { useFavorites } from '../hooks/useFavorites';

const Favorites = () => {
    const { favorites } = useFavorites();

    return (
        <main className='main-container'>
            <h1>Favorites</h1>

            {/* Snapshots come straight from localStorage — no API calls here. */}
            <CharacterList
                characters={favorites.length ? favorites : null}
                emptyMessage='No favorites yet'
            />
        </main>
    );
};

export default Favorites;
