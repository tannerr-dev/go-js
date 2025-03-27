class AnimatedLoading extends HTMLElement {
    constructor(){
        super();
    }
    //dont use the constructor for using data attributes
    conectedCallback(){
        const elements = this.dataset.elements; // data-elements
        const width = this.dataset.width;
        const height = this.dataset.height;

        for (let i = 0; i<elements; i++){
            const wrapper = document.createElement("div")
            wrapper.classList.add("loading-wave");
            wrapper.style.width= width;
            wrapper.style.height= height;
            wrapper.style.display = "inline-block";
            wrapper.style.margin= "10px";
            this.appendChild(wrapper);
        }
    }
}

customElements.define("animated-loading", AnimatedLoading)
