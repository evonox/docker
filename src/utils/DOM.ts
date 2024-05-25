import { IRect } from "../common/dimensions";

const COORDINATE_PRECISION = 3;

export interface CSSClassObject {
    [key: string]: boolean;
}

/**
 * TODO: INTRODUCE VALUE CACHING
 */
export class DOM<T extends HTMLElement> {

    constructor(private element: T) {}

    removeAllChildren(): DOM<T> {
        const domElements = this.element.children;
        for(let i = 0; i < domElements.length; i++) {
            domElements.item(i).remove();
        }
        return this;
    }

    removeFromDOM() {
        this.element.remove();
    }

    hasClass(name: string): boolean {
        return this.element.classList.contains(name);
    }

    addClass(name: string): DOM<T> {
        this.element.classList.add(name);
        return this;
    }

    removeClass(name: string): DOM<T> {
        this.element.classList.remove(name);
        return this;
    }

    removeClasses(names: string[]): DOM<T> {
        for(const cssClass of names) {
            this.removeClass(cssClass);
        }
        return this;
    }

    applyClasses(classObject: CSSClassObject): DOM<T> {
        for(const cssClass in classObject) {
            if(classObject[cssClass] === true) {
                this.addClass(cssClass);
            } else {
                this.removeClass(cssClass);
            }
        }
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

    getLeft(): number {
        const bounds = this.element.getBoundingClientRect();
        return bounds.left;
    }

    getTop(): number {
        const bounds = this.element.getBoundingClientRect();
        return bounds.top;
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

    zIndex(value: number | string): DOM<T> {
        if(value === "") {
            this.element.style.setProperty("z-index", "");
        } else {
            this.element.style.setProperty("z-index", String(value));
        }
        return this;
    }

    getZIndex(): number {
        return parseInt(this.getCss("z-index"));
    }

    applyRect(rect: DOMRect | IRect): DOM<T> {
        if(rect instanceof DOMRect) {
            this.left(rect.left).top(rect.top).width(rect.width).height(rect.height);
        } else {
            this.left(rect.x).top(rect.y).width(rect.w).height(rect.h);
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

    prependChild(child: HTMLElement | DOM<HTMLElement>): DOM<T> {
        const firstElement = this.element.firstChild;
        if(firstElement === null) {
            return this.appendChild(child);
        } else {
            if(child instanceof DOM) {
                this.element.insertBefore(child.get(), firstElement);
            } else {
                this.element.insertBefore(child, firstElement);
            }
            return this;   
        }
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

    hide(): DOM<T> {
        this.css("display", "none");
        return this;
    }

    show(): DOM<T> {
        this.css("display", "");
        return this;
    }

    once(eventName: string, handler: (event: Event) => void) {
        const handleEventOnce = (event: Event) => {
            this.element.removeEventListener(eventName, handleEventOnce);
            handler(event);
        }
        this.element.addEventListener(eventName, handleEventOnce);
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
