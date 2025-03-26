export class MovieItemComponent extend HTMLElement {
    constructor(movie){
        super();
        this.movie = movie;
    }
    connectedCallback(){
        this.innerHTML = `
            <a href="#"
                <article>
                    <img src="${this.movie.poster_url}" 
                        alt="${this.movie.title} Poster"
                    >
                    <p>${this.movie.title} (${this.movie.release_year})</p>
                </article>
            </a>
        `
    }
}

customElements.define("movie-item", MovieItemComponent)
