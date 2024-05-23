import { DOM } from "./DOM";

export interface MouseEventHandler {
    (event: MouseEvent): void;
}

/**
 * TODO: CANCEL BY ESCAPE KEY
 */
export class DragAndDrop {

    static readonly THRESHOLD = 5;
    static readonly BLOCKER_ZINDEX = 1e6;


    static start(event: MouseEvent, mousemove: MouseEventHandler, mouseup: MouseEventHandler, cursor: string = "grabbing", threshold: number = this.THRESHOLD) {

        let startingX = event.pageX;
        let startingY = event.pageX;

        let domBlocker = DOM.create("div").addClass("DockerTS-Blocker")
            .css("position", "absolute").left(0).top(0).width("100%").height("100%")
            .css("cursor", cursor).css("z-index", String(this.BLOCKER_ZINDEX))
            .appendTo(document.body);

        event.preventDefault();

        const isInsideThreshold = (event: MouseEvent) => {
            return Math.max(event.pageX - startingX) < threshold
                && Math.max(event.pageY - startingY) < threshold;
        }
        

        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            
            mousemove(e);

            startingX = event.pageX;
            startingY = event.pageY;
        }

        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();
            window.removeEventListener("mousemove", handleMouseMove, {capture: true});
            window.removeEventListener("mouseup", handleMouseUp, {capture: true});

            mouseup(e)

            domBlocker.removeFromDOM();
            domBlocker = undefined;
        }

        window.addEventListener("mousemove", handleMouseMove, {capture: true});
        window.addEventListener("mouseup", handleMouseUp, {capture: true});
    }
}
