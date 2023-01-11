const Card = ({ id, image, name, status, location }) => {

    return (
        <div>
            <p>{name}</p>
            <img src={image} alt={name}/>
            <div className="">
                <p className="">Last Location</p>
                <p className="fs-5">{location.name}</p>
            </div>
        </div>
    )
}

export default Card;