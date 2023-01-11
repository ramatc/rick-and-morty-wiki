import { useState, useEffect } from 'react';
import CharacterList from '../CharacterList';
import Search from '../Search/';
import Card from '../Character';
import Pagination from '../Pagination'
import Filter from '../Filter/';
import Navbar from '../NavBar/';
// import {getAllCharacters} from '../services/getAllCharacters':

const API_KEY = `https://rickandmortyapi.com/api/character`;

function CharacterListContainer() {

    const [characters, setCharacters] = useState([]);
    
    useEffect(() => {
        fetch(API_KEY)
            .then(res => res.json())
            .then(data => setCharacters(data))
            .catch(err => console.log(err))
            // .finally(() => setLoading(false));
    }, []);

    const { info, results } = characters;
    
    return (
        <div>
            <h1>Characters</h1>
            <div>
                <div>
                    Filter component will be placed here
                    <CharacterList characters={results} />
                </div>
            </div>
        </div>
    )
}

export default CharacterListContainer;