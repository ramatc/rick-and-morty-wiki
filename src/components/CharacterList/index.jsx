import Character from '../CharacterCard';
import NotFound from '../NotFound';
import './styles.css';

const CharacterList = ({ characters }) => {

    return (
        <>
            {
                characters
                    ? <div className='characters'>
                        {characters.map(character => <Character {...character} key={character.id} />)}
                    </div>
                    : <NotFound />
            }
        </>
    )
}

export default CharacterList;