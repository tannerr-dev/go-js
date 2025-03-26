import {API} =  from "../services/API.js"
export class HomePage extends HTMLElement  {
    async render(){
        const topMovies = await API.getTopMovies()
        renderMoviesInList(topMovies, document.querySelector("top-10"));
        
        const topMovies = await API.getRandomMovies()
        renderMoviesInList(topMovies, document.querySelector("random"));
        

        function renderMoviesInList(movies, ul){
            ul.innerHTML = "";
            movies.forEach(
                const li = document.createElement("li");
                li.textContent = movie.title;
                ul.appendChild(li);
            )
        }
    }
    connectedCallback(){
        const template = document.getElementById("template-home")
        const content = template.content.cloneNode(true);
        this.appendChild(content);
        this.render()
    }
}

customElements.define("home-page", HomePage);
