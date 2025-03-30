import {HomePage} from "../components/HomePage.js"
import {MovieDetailsPage} from "../components/MovieDetailsPage.js"
import {MoviePage} from "../components/MoviePage.js"
export const routes = [
    {
        path: "/",
        component: HomePage,
    },
    {
        path: /\/movies\/(\d+)/,
        component: MovieDetailsPage,
    },
    {
        path: "/movies", // search results
        component: MoviePage,
    },

]
