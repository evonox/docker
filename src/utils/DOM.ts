

export class DOM<T extends HTMLElement> {

    constructor(private element: T) {}

    addClass(name: string): DOM<T> {
        this.element.classList.add(name);
        return this;
    }

    removeClass(name: string): DOM<T> {
        this.element.classList.remove(name);
        return this;
    }

    text(text: string): DOM<T> {
        this.element.innerText = text;
        return this;
    }

    html(html: string): DOM<T> {
        this.element.innerHTML = html;
        return this;
    }

    onClick(handler: (e: MouseEvent) => void): DOM<T> {
        this.element.onclick = handler;
        return this;
    }

    toggleClass(name: string, flag: boolean): DOM<T> {
        if(flag) {
            this.addClass(name);
        } else {
            this.removeClass(name);
        }
        return this;
    }

    addClasses(names: string[]) {
        for(const name of names) {
            this.addClass(name);
        }
        return this;
    }

    appendTo(container: HTMLElement): DOM<T> {
        container.appendChild(this.element);
        return this;
    }

    get(): T {
        return this.element;
    }

    static from<T extends HTMLElement>(element: T): DOM<T> {
        return new DOM(element);
    }

    static create<K extends keyof HTMLElementTagNameMap>(name: K): DOM<HTMLElementTagNameMap[K]> {
        const element = document.createElement(name);
        return new DOM<HTMLElementTagNameMap[K]>(element);
    }
}
