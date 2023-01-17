import './styles.css';

const CharacterCard = ({ image, name, species, status, location }) => {

    return (
        <div className='character-card'>
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
        </div>
    )
}

export default CharacterCard;