export const getAllCharacters = async (pageNumber, search, filters) => {
    const { status, gender, species } = filters;

    try {
        const API_KEY = `https://rickandmortyapi.com/api/character/?page=${encodeURI(pageNumber)}&name=${encodeURI(search)}&status=${encodeURI(status)}&gender=${encodeURI(gender)}&species=${encodeURI(species)}`;
        const response = await fetch(API_KEY);
        const json = await response.json();

        const data = json;

        return data;

    } catch (error) {
        throw new Error('Error searching characters');
    }
}

export const getCharacterById = async (id) => {
    if(id === '') return null;

    try {
        const API_KEY = `https://rickandmortyapi.com/api/character/${encodeURI(id)}`;
        const response = await fetch(API_KEY);
        const data = await response.json();

        return data;

    } catch (error) {
        throw new Error('Error searching character');
    }
}