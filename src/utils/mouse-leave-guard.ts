
/**
 * Triggers the handler when the mouse leaves all the elements given
 */
export class MouseLeaveGuard {

    private handlerTriggered: boolean = false;

    constructor(private elements: HTMLElement[], private mouseLeaveHandler: () => void) {
        this.handleMouseMove = this.handleMouseMove.bind(this);
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
                this.handlerTriggered = true;
                this.mouseLeaveHandler();
            }
        }
    }

    private isInsideRect(event: MouseEvent, element: HTMLElement): boolean {
        const bounds = element.getBoundingClientRect();
        return bounds.left <= event.pageX && bounds.top <= event.pageY &&
            event.pageX <= bounds.right && event.pageY <= bounds.bottom;
    }
}
