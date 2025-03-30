import {API} from "./services/API.js";
import { HomePage } from "./components/HomePage.js";
import { MovieDetailsPage} from "./components/MovieDetailsPage.js";
import "./components/AnimatedLoading.js";
import "./components/YouTubeEmbed.js";
import { Router } from "./services/Router.js";


window.addEventListener("DOMContentLoaded", event => {
    app.Router.init()
    // we do not need to inject the homepage or details page anymore since
    // the Router does that now
    // document.querySelector("main").appendChild(new HomePage())
    // document.querySelector("main").appendChild(new MovieDetailsPage())
});

window.app = {
    Router, // same as Router: Router; // js shortcut
    search: (event)=> {
        event.preventDefault()
        const q = document.querySelector("input[type=search]").value;
        // todo
    },
    api: API
}
