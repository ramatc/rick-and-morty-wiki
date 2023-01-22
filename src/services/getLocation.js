export const getLocationById = async (number) => {

    const API_KEY = `https://rickandmortyapi.com/api/location/${encodeURI(number)}`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    const residents = await Promise.all(
        data.residents.map((url) => {
            return fetch(url).then((res) => res.json());
        })
    );
    
    const response = {data, residents}

    return response;
}

export const getLocationCount = async () => {

    const API_KEY = `https://rickandmortyapi.com/api/location`;
    const resp = await fetch(API_KEY);
    const data = await resp.json();

    return data.info.count;
}