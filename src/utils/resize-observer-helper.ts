
export interface IResizeObservedElement {
    unobserve(): void;
}

export interface IAdoptProcessAPI {
    complete(): void;
}

/**
 * Central ResizeObserver Helper
 */
export class ResizeObserverHelper {

    private static observedElementsMap: WeakMap<Element, () => void>
        = new WeakMap<HTMLElement, () => void>();

    private static resizeObserver = new ResizeObserver(entries => this.handleResizeObserverChanges(entries));

    private static  handleResizeObserverChanges(entries: ResizeObserverEntry[]) {
        console.log("BEGIN RESIZE OBSERVER");
        console.dir(entries);
        entries.forEach(entry => console.dir(entry.target));
        for(const entry of entries) {
            if(this.observedElementsMap.has(entry.target)) {
                const handler = this.observedElementsMap.get(entry.target);
                handler?.();
            }
        }
        console.log("END RESIZE OBSERVER");
    }

    static observeElement(element: HTMLElement, handler: () => void): IResizeObservedElement {
        this.observedElementsMap.set(element, handler);
        this.resizeObserver.observe(element);
        return {
           unobserve: () => {
                this.resizeObserver.unobserve(element);
                this.observedElementsMap.delete(element);
           }
        }
    }
}
