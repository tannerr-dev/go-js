export class YouTubeEmbed extends HTMLElement {
    static get observedAttributes(){
        return ['data-url'];
    }
    attributeChangedCallback(prop, value){
        if (prop === "data-url"){
            const url = this.dataset.url;
            console.log(url);
        }
    }
}
customElements.define("youtube-embed", YouTubeEmbed);
