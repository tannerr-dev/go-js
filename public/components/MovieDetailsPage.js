import { API } from "../services/API.js";

export class MovieDetailsPage extends HTMLElement { 
    id = null
    movie = null

    async render(){
        try {
            this.movie = await API.getMovieById(this.id)
        } catch {
            alert("Movie doesn't exist") // replace later
            return;
        }
        const template = document.getElementById("template-movie-details")
        const content = template.content.cloneNode(true);
        this.appendChild(content)

        this.querySelector("h2").textContent = this.movie.title;
        this.querySelector("h3").textContent = this.movie.tagline;
        this.querySelector("img").src = this.movie.poster_url;
        this.querySelector("#overview").src = this.movie.overview;
        this.querySelector("#metadata").innerHTML = `
            <dt>Release Year</dt>
            <dd>${this.movie.release_year}</dd>
            <dt>Score</dt>
            <dd>${this.movie.score} / 10</dd>
            <dt>Popularity</dt>
            <dd>${this.movie.popularity}</dd>
        `
    }

    connectedCallback(){
        this.id = 14; //todo
        this.render();
    }
}
customElements.define("movie-details-page", MovieDetailsPage);
