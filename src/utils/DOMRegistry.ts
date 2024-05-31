import { DOM } from "./DOM";

/**
 * DOMHelper Registry - GoF Flyweight Pattern
 */
export class DOMRegistry {

    private static registry: WeakMap<HTMLElement, DOM<HTMLElement>> = new WeakMap();

    static existsDOM(element: HTMLElement): boolean {
        return this.registry.has(element);
    }

    static getDOM(element: HTMLElement): DOM<HTMLElement> | undefined {
        if(this.registry.has(element)) {
            return this.registry.get(element);
        } else {
            return undefined;
        }
    }

    static setDOM(element: HTMLElement, dom: DOM<HTMLElement>) {
        this.registry.set(element, dom);
    }
}
