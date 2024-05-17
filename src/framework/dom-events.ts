

export interface DOMEventHandler<EVT extends Event> {
    (event: EVT): void;
}

export class DOMEvent<EVT extends Event> {

    private domElement?: Element | Window;
    private name?: string;
    private handler?: DOMEventHandler<EVT>;
    private isCapture: boolean;

    constructor(domElement: Element | Window) {
        this.domElement = domElement;
    }

    bind(name: string, handler: DOMEventHandler<EVT>, options: {capture: boolean}) {
        this.name = name;
        this.handler = handler;
        this.isCapture = options.capture;

        this.domElement.addEventListener(name, handler, {capture: options.capture});
    }

    unbind() {
        if(this.domElement && this.name && this.handler) {
            this.domElement.removeEventListener(this.name, this.handler, {capture: this.isCapture});
            this.cleanup();
        }
    }

    private cleanup() {
        this.domElement = undefined;
        this.name = undefined;
        this.handler = undefined;
    }
}

export type DOMMouseEvent = DOMEvent<MouseEvent>;

export type DOMTouchEvent = DOMEvent<TouchEvent>;

export type DOMKeyboardEvent = DOMEvent<KeyboardEvent>;
