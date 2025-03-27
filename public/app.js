import {API} from "./services/API.js";
import { HomePage } from "./components/HomePage.js";
import { MovieDetailsPage} from "./components/MovieDetailsPage.js";
import "./components/AnimatedLoading.js";

window.addEventListener("DOMContentLoaded", event => {
    // document.querySelector("main").appendChild(new HomePage())
    document.querySelector("main").appendChild(new MovieDetailsPage())
});

window.app = {
    search: (event)=> {
        event.preventDefault()
        const q = document.querySelector("input[type=search]").value;
        // todo
    },
    api: API
}
