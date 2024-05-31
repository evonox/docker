import { IRect, ISize } from "../common/dimensions";
import { ArrayUtils } from "./ArrayUtils";
import { DOMRegistry } from "./DOMRegistry";
import { DOMUpdateInitiator } from "./DOMUpdateInitiator";
import { RectHelper } from "./rect-helper";

const COORDINATE_PRECISION = 3;

export interface CSSClassObject {
    [key: string]: boolean;
}

/**
 * DOM Helper Class with caching support
 */
export class DOM<T extends HTMLElement> {

    private cssClasses: Set<string> = new Set<string>();

    constructor(private element: T) {
        DOMRegistry.setDOM(this.element, this);
        this.scanCssClasses();
    }

    /**
     * CSS Classes Management
     */

    hasClass(name: string): boolean {
        return this.cssClasses.has(name);
    }

    addClass(name: string): DOM<T> {
        if(this.cssClasses.has(name) === false) {
            this.cssClasses.add(name);

            DOMUpdateInitiator.requestDOMUpdate(() => {
                this.element.classList.add(name);
            });
            // TODO: DEBUG            
            DOMUpdateInitiator.forceEnqueuedDOMUpdates();
        }
        return this;
    }

    removeClass(name: string): DOM<T> {
        if(this.cssClasses.has(name) === true) {
            this.cssClasses.delete(name);

            DOMUpdateInitiator.requestDOMUpdate(() => {
                this.element.classList.remove(name);
            });
            // TODO: DEBUG            
            DOMUpdateInitiator.forceEnqueuedDOMUpdates();
        }        
        return this;
    }

    addClasses(names: string[]): DOM<T> {
        for(const name of names) {
            this.addClass(name);
        }
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

    private scanCssClasses() {
        [...this.element.classList].forEach(cssClass => this.cssClasses.add(cssClass));
    }

    /**
     * Generic CSS Style management
     */

    private styleMap: Map<string, string> = new Map<string, string>();

    getCss(name: string): string {
        if(this.styleMap.has(name)) {
            return this.styleMap.get(name);
        } else {
            const cssValue = this.element.style.getPropertyValue(name);
            this.styleMap.set(name, cssValue);
            return cssValue;
        }
    }

    css(propertyName: string, propertyValue: string): DOM<T> {
        if(this.styleMap.has(propertyName) && this.styleMap.get(propertyName) === propertyValue)
            return this;

        if(propertyValue.trim() === "") {
            this.styleMap.delete(propertyName);
        } else {
            this.styleMap.set(propertyName, propertyValue);
        }

        DOMUpdateInitiator.requestDOMUpdate(() => {
            this.element.style.setProperty(propertyName, propertyValue);
        });
        // TODO: DEBUG            
        DOMUpdateInitiator.forceEnqueuedDOMUpdates();

        return this;
    }


    /**
     * Dimensions Changing Methods
     */

    getLeft(): number {
        if(this.styleMap.has("left") === false)  {
            return this.element.offsetLeft;
        } else {
            return parseFloat(this.getCss("left"));
        }
    }

    getTop(): number {
        if(this.styleMap.has("top") === false) {
            return this.element.offsetTop;
        } else {
            return parseFloat(this.getCss("top"));           
        }
    }

    getWidth(): number {
        if(this.styleMap.has("width") === false) {
            return this.element.offsetWidth;
        } else {
            return parseFloat(this.getCss("width"));
        }
    }

    getHeight(): number {
        if(this.styleMap.has("height") === false) {
            return this.element.offsetHeight;
        } else {
            return parseFloat(this.getCss("height"));
        }
    }

    getBounds(): DOMRect {
        return this.element.getBoundingClientRect();
    }

    getBoundsRect(): IRect {
        return RectHelper.fromDOMRect(this.getBounds());
    }

    getComputedRect(): IRect {
        const computedStyle = window.getComputedStyle(this.element);
        return {
            x: parseFloat(computedStyle.left),
            y: parseFloat(computedStyle.top),
            w: parseFloat(computedStyle.width),
            h: parseFloat(computedStyle.height)
        };
    }

    getClientRect(): IRect {
        return {
            x: this.element.clientLeft,
            y: this.element.clientTop,
            w: this.element.clientWidth,
            h: this.element.clientHeight
        }
    }

    getOffsetRect(): IRect {
        return {
            x: this.element.offsetLeft,
            y: this.element.offsetTop,
            w: this.element.offsetWidth,
            h: this.element.offsetHeight
        }
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

    applyRect(rect: DOMRect | IRect): DOM<T> {
        if(rect instanceof DOMRect) {
            this.left(rect.left).top(rect.top).width(rect.width).height(rect.height);
        } else {
            this.left(rect.x).top(rect.y).width(rect.w).height(rect.h);
        }
        return this;
    }


    /**
     * Misc Methods
     */

    getElement(): T {
        return this.element;
    }

    getOffsetParent(): DOM<HTMLElement> {
        if(this.element.offsetParent instanceof HTMLElement) {
            return new DOM<HTMLElement>(this.element.offsetParent);
        }
    }

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

    text(text: string): DOM<T> {
        this.element.innerText = text;
        return this;
    }


    getText(): string {
        return this.element.innerText;
    }

    getHtml(): string {
        return this.element.innerHTML;
    }


    html(html: string): DOM<T> {
        this.element.innerHTML = html;
        return this;
    }
    
    attr(name: string, value: string): DOM<T> {
        this.element.setAttribute(name, value);
        return this;
    }


    zIndex(value: number | string): DOM<T> {
        if(value === "") {
            this.css("z-index", "");
        } else {
            this.css("z-index",  String(value));
        }
        return this;
    }

    getZIndex(): number {
        return parseInt(this.getCss("z-index"));
    }


    onClick(handler: (e: MouseEvent) => void): DOM<T> {
        this.element.onclick = handler;
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
        let domValue = DOMRegistry.getDOM(element);
        if(domValue !== undefined) {
            return domValue as DOM<T>;
        } else {
            return new DOM(element);
        }
    }

    static create<K extends keyof HTMLElementTagNameMap>(name: K): DOM<HTMLElementTagNameMap[K]> {
        const element = document.createElement(name);
        return new DOM<HTMLElementTagNameMap[K]>(element);
    }
}
