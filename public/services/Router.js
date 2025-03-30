import { routes } from "./Routes.js";
// since there is only one router we are not making it a class just an object
export const Router = {
    init: ()=>{
        window.addEventListener("popstate",()=>{
            Router.go(location.pathname, false);
        })
        // enhance current links
        document.querySelectorAll("a.navlink").forEach(a=>{
            a.addEventListener("click", event => {
                event.preventDefault();
                const href = a.getAttribute("href");
                Router.go(href);
            })
        });
        // go to the initial route
        Router.go(location.pathname + location.search)
    },
    //
    go: (route, addToHistory=true)=>{
        if (addToHistory) {
            history.pushState(null, "", route)
        }

        let pageElement = null;

        const routePath = route.includes('?') ? route.split("?")[0] : route;
        for (const r of routes){
            if (typeof r.path === "string" && r.path === routePath){
                // string path
                pageElement = new r.component();
                break;
            } else if (r.path instanceof RegExp){
                //RegEx path
                const match = r.path.exec(route);
                if (match) {
                    pageElement = new r.component();
                    const params = match.slice(1);
                    pageElement.params = params;
                    break;
                }
            }
        }
        if(pageElement == null){
            pageElement = document.createElement("h1");
            pageElement.textContent = "Page not found :(";
        }
        // i have  a page for the current URL
        document.querySelector("main").innerHTML = "";
        document.querySelector("main").appendChild(pageElement);
    },
}
