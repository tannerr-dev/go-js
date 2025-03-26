import {API} from "./services/API.js";

window.addEventListener("")

window.app = {
    search: (event)=> {
        event.preventDefault()
        const q = document.querySelector("input[type=search]").value;
        // todo
    },
    api: API
}
