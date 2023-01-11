import Character from '../CharacterCard';
import './styles.css';

const CharacterList = ({ characters }) => {

    return (
        <div className='characters'>
            {characters 
                ? characters.map(character => <Character {...character} key={character.id}/>) 
                : 'No Characters Found :('
            }
        </div>
    )
}

export default CharacterList;