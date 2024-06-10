import { EventHelper } from "./event-helper";

/**
 * Triggers the handler when the mouse leaves all the elements given
 */
export class MouseLeaveGuard {

    private handlerTriggered: boolean = false;
    private delayedMouseLeaveHandler: any;
    
    constructor(private elements: HTMLElement[], private mouseLeaveHandler: () => void, hideDelay: number) {
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.delayedMouseLeaveHandler = EventHelper.debounce(
            () => {
                this.handlerTriggered = true;
                mouseLeaveHandler();
            }, hideDelay, {leading: false, trailing: true}
        );
        window.addEventListener("mousemove", this.handleMouseMove);
    }

    dispose() {
        window.removeEventListener("mousemove", this.handleMouseMove);
    }

    private handleMouseMove(event: MouseEvent) {
        let flag = false;
        for(const element of this.elements) {
            flag = flag || this.isInsideRect(event, element);
        }
        if(flag === false) {
            if(! this.handlerTriggered) {
                this.delayedMouseLeaveHandler();
            }
        } else {
            this.delayedMouseLeaveHandler.cancel();
        }
    }

    private isInsideRect(event: MouseEvent, element: HTMLElement): boolean {
        const bounds = element.getBoundingClientRect();
        return bounds.left <= event.pageX && bounds.top <= event.pageY &&
            event.pageX <= bounds.right && event.pageY <= bounds.bottom;
    }
}
