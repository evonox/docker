
const COORDINATE_PRECISION = 3;

/**
 * TODO: INTRODUCE VALUE CACHING
 */
export class DOM<T extends HTMLElement> {

    constructor(private element: T) {}

    removeFromDOM() {
        this.element.remove();
    }

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

    getCss(name: string): string {
        return this.element.style.getPropertyValue(name);
    }

    getText(): string {
        return this.element.innerText;
    }

    getHtml(): string {
        return this.element.innerHTML;
    }

    getWidth(): number {
        return this.element.clientWidth;
    }

    getHeight(): number {
        return this.element.clientHeight;
    }

    getBounds(): DOMRect {
        return this.element.getBoundingClientRect();
    }

    html(html: string): DOM<T> {
        this.element.innerHTML = html;
        return this;
    }
    
    attr(name: string, value: string): DOM<T> {
        this.element.setAttribute(name, value);
        return this;
    }

    left(value: number | string) {
        if(typeof value === "string") {
            this.css("left", value);
        } else {
            this.css("left", value.toFixed(COORDINATE_PRECISION) + "px");
        }
        return this;
    }

    top(value: number | string) {
        if(typeof value === "string") {
            this.css("top", value);
        } else {
            this.css("top", value.toFixed(COORDINATE_PRECISION) + "px");
        }
        return this;
    }

    width(value: number | string) {
        if(typeof value === "string") {
            this.css("width", value);
        } else {
            this.css("width", value.toFixed(COORDINATE_PRECISION) + "px");
        }
        return this;
    }

    height(value: number | string) {
        if(typeof value === "string") {
            this.css("height", value);
        } else {
            this.css("height", value.toFixed(COORDINATE_PRECISION) + "px");
        }
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

    css(propertyName: string, propertyValue: string): DOM<T> {
        this.element.style.setProperty(propertyName, propertyValue);
        return this;
    }

    appendTo(container: HTMLElement | DOM<HTMLElement>): DOM<T> {
        if(container instanceof DOM) {
            container.get().appendChild(this.element);
        } else {
            container.appendChild(this.element);
        }
        return this;
    }

    appendChild(child: HTMLElement | DOM<HTMLElement>): DOM<T> {
        if(child instanceof DOM) {
            this.element.appendChild(child.get());
        } else {
            this.element.appendChild(child);
        }
        return this;
    }

    appendChildren(children: (HTMLElement | DOM<HTMLElement>)[]): DOM<T> {
        for(const child of children) {
            this.appendChild(child);
        }
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
