import { Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import './styles.css';

const CharacterCard = ({ id, image, name, species, status, location }) => {

    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(id);

    const handleToggleFavorite = (event) => {
        // The whole card is a <Link>; block navigation so the star only favorites.
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite({ id, image, name, species, status, location });
    };

    return (
        <Link to={`/character/${id}`} className='character-card'>
            <img src={image} alt={name} className='character-img' />

            <button
                type='button'
                className='favorite-toggle'
                aria-pressed={favorite}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={handleToggleFavorite}
            >
                <span aria-hidden='true'>{favorite ? '★' : '☆'}</span>
            </button>

            <div className='character-container'>
                <p className='character-name'>{name}</p>
                <p>{species}</p>

                <div className='character-location'>
                    <small className="">Last know location:</small>
                    <p className="fs-5">{location.name}</p>
                </div>

                <p className={`character-status ${status}`}>
                    {status}
                </p>
            </div>
        </Link>
    )
}

export default CharacterCard;
