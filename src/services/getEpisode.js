export const getEpisodeById = async (id) => {

    const API_KEY = `https://rickandmortyapi.com/api/episode/${encodeURI(id)}`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    const characters = await Promise.all(
        data.characters.map((url) => {
            return fetch(url).then((res) => res.json());
        })
    );
    
    const response = {data, characters}

    return response;
}

export const getEpisodeCount = async () => {

    const API_KEY = `https://rickandmortyapi.com/api/episode`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    return data.info.count;
}