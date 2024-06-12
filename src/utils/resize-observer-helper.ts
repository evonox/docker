
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
        for(const entry of entries) {
            if(this.observedElementsMap.has(entry.target)) {
                const handler = this.observedElementsMap.get(entry.target);
                handler?.();
            }
        }
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
