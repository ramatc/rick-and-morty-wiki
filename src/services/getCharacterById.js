export const getCharacterById = async (id) => {

    const API_KEY = `https://rickandmortyapi.com/api/character/${encodeURI(id)}`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    return data;
}