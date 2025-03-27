export const API = {
    baseURL: "/api/",
    getTopMovies: async ()=> {
        return await API.fetch("movies/top/")
    },
    getRandomMovies: async ()=> {
        return await API.fetch("movies/random")
    },
    getMovieById: async (id)=>{
        return await API.fetch(`movies/${id}`)
    },
    searchMovies: async (q, order, genre)=>{
        return await API.fetch(`movies/search/`, {q, order, genre})
    },
    fetch: async (serviceName, args)=> {
        try{
            const queryString = args ? new URLSearchParams(args).toString(): "";
            const response = await fetch(API.baseURL + serviceName + "?" + queryString);
            const result = await response.json();
            return result;
        } catch (e) {
            console.error(e);
        }
    }
}
