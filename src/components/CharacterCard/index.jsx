import { Link } from 'react-router-dom';
import './styles.css';

const CharacterCard = ({ id, image, name, species, status, location }) => {

    return (
        <Link to={`/character/${id}`} className='character-card'>
            <img src={image} alt={name} className='character-img' />
            <div className='character-container'>
                <p className='character-name'>{name}</p>
                <p>{species}</p>

                <div className='character-location'>
                    <small className="">Last know location:</small>
                    <p className="fs-5">{location.name}</p>
                </div>

                <p className={`character-status ${status.toLowerCase()}`}>
                    {status.toLowerCase()}
                </p>
            </div>
        </Link>
    )
}

export default CharacterCard;