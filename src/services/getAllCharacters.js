export const getAllCharacters = async (pageNumber, search) => {
    const API_KEY = `https://rickandmortyapi.com/api/character/?page=${encodeURI(pageNumber)}&name=${encodeURI(search)}`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    return data;
}