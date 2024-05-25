import { DOM } from "./DOM";
import * as  _ from "lodash-es";
import { IPoint } from "./overlay-helper";

export interface MouseEventHandler {
    (event: MouseEvent): void;
}

/**
 * Drag-and-Drop Helper Class
 */
export class DragAndDrop {

    private static BLOCKER_ZINDEX = 0;
    private static FRAME_RATE = 0;
    private static MOVE_DETECTION_THRESHOLD = 5;

    private static domBlocker: DOM<HTMLElement>;

    static initialize(blockerZIndex: number, frameRate: number) {
        this.BLOCKER_ZINDEX = blockerZIndex;
        this.FRAME_RATE = frameRate;
    }

    private static createBlocker(cursor: string) {
        this.domBlocker = DOM.create("div").addClass("DockerTS-Blocker")
            .css("position", "absolute").left(0).top(0).width("100%").height("100%")
            .css("cursor", cursor).css("z-index", String(this.BLOCKER_ZINDEX))
            .appendTo(document.body);
    }

    private static removeBlocker() {
        this.domBlocker?.removeFromDOM();
        this.domBlocker = undefined;
    }

    static start(event: MouseEvent, mousemove: MouseEventHandler, mouseup: MouseEventHandler, cursor: string = "grabbing") {

        let isDragAndDropStarted = false;
        let isDragAndDropCancelled = false;

        let initialPosition: IPoint = {x: event.pageX, y: event.pageY};

        const shouldTriggerDragAndDrop = (event: MouseEvent) => {
            return Math.abs(event.pageX - initialPosition.x) > this.MOVE_DETECTION_THRESHOLD
                || Math.abs(event.pageY - initialPosition.y) > this.MOVE_DETECTION_THRESHOLD;
        }


        let handleMouseMove = (e: MouseEvent) => {
            if(isDragAndDropStarted === false) {
                if(shouldTriggerDragAndDrop(e)) {
                    this.createBlocker(cursor);
                    isDragAndDropStarted = true;
                }
            } else {
                e.preventDefault();           
                if(isDragAndDropCancelled === false) {
                    mousemove(e);
                }   
            }

        }

        handleMouseMove = _.throttle(handleMouseMove, 1000 / this.FRAME_RATE, {leading: true, trailing: true});

        const handleMouseUp = (e: MouseEvent) => {
            event.preventDefault();

            this.removeBlocker();

            window.removeEventListener("mousemove", handleMouseMove, {capture: true});
            window.removeEventListener("mouseup", handleMouseUp, {capture: true});
            window.removeEventListener("keydown", handleKeyDown, {capture: true});

            if(isDragAndDropCancelled === false) {
                mouseup(e)
            }

        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === "Escape") {
                isDragAndDropCancelled = true;
                this.domBlocker.css("cursor", "default");

                e.preventDefault();
            }
        }

        window.addEventListener("mousemove", handleMouseMove, {capture: true});
        window.addEventListener("mouseup", handleMouseUp, {capture: true});
        window.addEventListener("keydown", handleKeyDown, {capture: true});
    }
}
