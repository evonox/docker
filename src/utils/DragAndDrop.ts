
export interface MouseEventHandler {
    (event: MouseEvent): void;
}

export class DragAndDrop {

    static readonly THRESHOLD = 5;


    static start(event: MouseEvent, mousemove: MouseEventHandler, mouseup: MouseEventHandler, threshold: number = this.THRESHOLD) {

        let startingX = event.pageX;
        let startingY = event.pageX;

        event.preventDefault();

        const isInsideThreshold = (event: MouseEvent) => {
            return Math.max(event.pageX - startingX) < threshold
                && Math.max(event.pageY - startingY) < threshold;
        }
        

        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();

            if(isInsideThreshold(e))
                return;
            
            mousemove(e);

            startingX = event.pageX;
            startingY = event.pageY;
        }

        const handleMouseUp = (e: MouseEvent) => {
            window.removeEventListener("mousemove", handleMouseMove, {capture: true});
            window.removeEventListener("mouseup", handleMouseUp, {capture: true});
            e.preventDefault();
            mouseup(e)
        }

        window.addEventListener("mousemove", handleMouseMove, {capture: true});
        window.addEventListener("mouseup", handleMouseUp, {capture: true});
    }
}
