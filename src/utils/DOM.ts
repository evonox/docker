import { IRect, ISize } from "../common/dimensions";
import { DOMRegistry } from "./DOMRegistry";
import { DOMUpdateInitiator } from "./DOMUpdateInitiator";
import { DebugHelper } from "./DebugHelper";
import { MathHelper } from "./math-helper";
import { RectHelper } from "./rect-helper";

export interface CSSClassObject {
    [key: string]: boolean;
}

/**
 * DOM Helper Class with caching support
 */
export class DOM<T extends HTMLElement> {

    private cssClasses: Set<string> = new Set<string>();

    private isBoundsCachingOn = true;

    constructor(private element: T) {
        DOMRegistry.setDOM(this.element, this);
        this.scanCssClasses();
    }

    /**
     * CSS Classes Management
     */

    hasClass(name: string): boolean {
        if(DebugHelper.isClassListCacheEnabled()) {
            return this.cssClasses.has(name);
        } else {
            return this.element.classList.contains(name);
        }
    }

    addClass(name: string): DOM<T> {
        if(DebugHelper.isClassListCacheEnabled()) {
            if(this.cssClasses.has(name) === false) {
                this.cssClasses.add(name);

                DOMUpdateInitiator.requestDOMUpdate(() => {
                    this.element.classList.add(name);
                });
            }
        } else {
            this.element.classList.add(name);
        }
        return this;
    }

    removeClass(name: string): DOM<T> {
        if(DebugHelper.isClassListCacheEnabled()) {
            if(this.cssClasses.has(name) === true) {
                this.cssClasses.delete(name);

                DOMUpdateInitiator.requestDOMUpdate(() => {
                    this.element.classList.remove(name);
                });
            }
        } else {
            this.element.classList.remove(name);
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
        if(DebugHelper.isCSSStyleCacheEnabled()) {
            if(this.styleMap.has(name) ) {
                return this.styleMap.get(name);   
            } else {
                const cssValue = this.element.style.getPropertyValue(name);
                if(cssValue !== "") {
                    this.styleMap.set(name, cssValue);
                }
                return cssValue;
            }   
        } else {
            return this.element.style.getPropertyValue(name);
        }
    }

    css(propertyName: string, propertyValue: string): DOM<T> {
        if(DebugHelper.isCSSStyleCacheEnabled()) {
            if(this.styleMap.has(propertyName) && this.styleMap.get(propertyName) === propertyValue)
                return this;

            if(propertyValue === undefined || propertyValue === null || propertyValue.trim() === "") {
                this.styleMap.delete(propertyName);
            } else {
                this.styleMap.set(propertyName, propertyValue);
            }

            DOMUpdateInitiator.requestDOMUpdate(() => {
                this.element.style.setProperty(propertyName, propertyValue);
            });
        } else {
            this.element.style.setProperty(propertyName, propertyValue);
        }

        return this;
    }


    /**
     * Dimensions Changing Methods
     */

    cacheBounds(flag: boolean): DOM<T> {
        this.isBoundsCachingOn = flag;
        return this;
    }

    getLeft(): number {
        if(this.isBoundsCachingOn === false || DebugHelper.isCSSStyleCacheEnabled() === false) {
            return this.getBoundingClientRect().left;
        } else if(this.styleMap.has("left") === false)  {
            this.storeBoundsToCache();
            return parseFloat(this.getCss("left"));
        } else {
            return parseFloat(this.getCss("left"));
        }
    }

    getTop(): number {
        if(this.isBoundsCachingOn === false || DebugHelper.isCSSStyleCacheEnabled() === false) {
            return this.getBoundingClientRect().top;
        } else if(this.styleMap.has("top") === false) {
            this.storeBoundsToCache();
            return parseFloat(this.getCss("top"));           
        } else {
            return parseFloat(this.getCss("top"));           
        }
    }

    getRight(): number {
        if(this.isBoundsCachingOn === false || DebugHelper.isCSSStyleCacheEnabled() === false) {
            return parseFloat(this.getCss("right"));           
        } else if(this.styleMap.has("right") === false) {
            this.storeBoundsToCache();
            return parseFloat(this.getCss("right"));           
        } else {
            return parseFloat(this.getCss("right"));           
        }
    }

    getBottom(): number {
        if(this.isBoundsCachingOn === false || DebugHelper.isCSSStyleCacheEnabled() === false) {
            return parseFloat(this.getCss("bottom"));           
        } else if(this.styleMap.has("bottom") === false) {
            this.storeBoundsToCache();
            return parseFloat(this.getCss("bottom"));           
        } else {
            return parseFloat(this.getCss("bottom"));           
        }
    }

    getWidth(): number {
        if(this.isBoundsCachingOn === false || DebugHelper.isCSSStyleCacheEnabled() === false) {
            return this.getBoundingClientRect().width;
        } else if(this.styleMap.has("width") === false) {
            this.storeBoundsToCache();
            return parseFloat(this.getCss("width"));
        } else {
            return parseFloat(this.getCss("width"));
        }
    }

    getHeight(): number {
        if(this.isBoundsCachingOn === false || DebugHelper.isCSSStyleCacheEnabled() === false) {
            return this.getBoundingClientRect().height;
        } else if(this.styleMap.has("height") === false) {
            this.storeBoundsToCache();
            return parseFloat(this.getCss("height"));
        } else {
            return parseFloat(this.getCss("height"));
        }
    }

    getBoundingClientRect(): DOMRect {
        return this.element.getBoundingClientRect();
    }

    getBoundsRect(): IRect {
        if(this.isBoundsCachingOn === false) {
            return RectHelper.fromDOMRect(this.getBoundingClientRect());
        } else {
            return {
                x: this.getLeft(),
                y: this.getTop(),
                w: this.getWidth(),
                h: this.getHeight()
            }
        }
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
            this.css("left", MathHelper.toPX(value));               
        }
        return this;
    }

    top(value: number | string) {
        if(typeof value === "string") {
            this.css("top", value);
        } else {
            this.css("top", MathHelper.toPX(value));
        }
        return this;
    }

    right(value: number | string) {
        if(typeof value === "string") {
            this.css("right", value);
        } else {
            this.css("right", MathHelper.toPX(value));               
        }
        return this;
    }

    bottom(value: number | string) {
        if(typeof value === "string") {
            this.css("bottom", value);
        } else {
            this.css("bottom", MathHelper.toPX(value));               
        }
        return this;
    }

    width(value: number | string) {
        if(typeof value === "string") {
            this.css("width", value);
        } else {
            this.css("width", MathHelper.toPX(value));
        }
        return this;
    }

    height(value: number | string) {
        if(typeof value === "string") {
            this.css("height", value);
        } else {
            this.css("height", MathHelper.toPX(value));
        }
        return this;
    }

    applySize(rect: DOMRect | IRect | ISize ): DOM<T> {
        if(rect instanceof DOMRect) {
            this.width(rect.width).height(rect.height);
        } else {
            this.width(rect.w).height(rect.h);
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

    private storeBoundsToCache() {
        let bounds = RectHelper.fromDOMRect(this.element.getBoundingClientRect());
        bounds = RectHelper.floor(bounds);
        if(this.styleMap.has("left") === false && DebugHelper.isCSSStyleCacheEnabled()) {
            this.styleMap.set("left", `${bounds.x}px`);
        }
        if(this.styleMap.has("top") === false && DebugHelper.isCSSStyleCacheEnabled()) {
            this.styleMap.set("top", `${bounds.y}px`);
        }
        if(this.styleMap.has("width") === false && DebugHelper.isCSSStyleCacheEnabled()) {
            this.styleMap.set("width", `${bounds.w}px`);
        }
        if(this.styleMap.has("height") === false && DebugHelper.isCSSStyleCacheEnabled()) {
            this.styleMap.set("height", `${bounds.h}px`);
        }
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
        if(typeof value === "number") {
            return this.css("z-index", String(value));
        } else {
            if(value === "") {
                this.css("z-index", "");
            } else {
                this.css("z-index",  String(value));
            }   
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
