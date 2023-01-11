import Character from '../Character';

const CharacterList = ({ characters }) => {

    return (
        <div>
            {characters 
                ? characters.map(character => <Character {...character} key={character.id}/>) 
                : 'No Characters Found :('
            }
        </div>
    )
}

export default CharacterList;