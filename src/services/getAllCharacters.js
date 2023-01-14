export const getAllCharacters = async (pageNumber, search, filters) => {
    const { status, gender, species } = filters;

    const API_KEY = `https://rickandmortyapi.com/api/character/?page=${encodeURI(pageNumber)}&name=${encodeURI(search)}&status=${encodeURI(status)}&gender=${encodeURI(gender)}&species=${encodeURI(species)}`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    return data;
}