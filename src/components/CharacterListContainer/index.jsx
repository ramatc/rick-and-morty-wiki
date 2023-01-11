import { useState, useEffect } from 'react';
import CharacterList from '../CharacterList';
import Search from '../Search/';
import Pagination from '../Pagination'
import Filter from '../Filter/';
// import {getAllCharacters} from '../services/getAllCharacters':
import './styles.css';

const API_KEY = `https://rickandmortyapi.com/api/character`;

function CharacterListContainer() {

    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetch(API_KEY)
            .then(res => res.json())
            .then(data => setCharacters(data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    const { info, results } = characters;
    
    return (
        <div className='main-container'>
            <h1>Characters</h1>
            <CharacterList characters={results} />
        </div>
    )
}

export default CharacterListContainer;