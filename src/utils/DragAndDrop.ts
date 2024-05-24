import { DOM } from "./DOM";
import * as  _ from "lodash-es";

export interface MouseEventHandler {
    (event: MouseEvent): void;
}

export class DragAndDrop {

    private static BLOCKER_ZINDEX = 0;
    private static FRAME_RATE = 0;

    static initialize(blockerZIndex: number, frameRate: number) {
        this.BLOCKER_ZINDEX = blockerZIndex;
        this.FRAME_RATE = frameRate;
    }

    static start(event: MouseEvent, mousemove: MouseEventHandler, mouseup: MouseEventHandler, cursor: string = "grabbing") {

        event.preventDefault();

        let domBlocker = DOM.create("div").addClass("DockerTS-Blocker")
            .css("position", "absolute").left(0).top(0).width("100%").height("100%")
            .css("cursor", cursor).css("z-index", String(this.BLOCKER_ZINDEX))
            .appendTo(document.body);

        let isDragAndDropCancelled = false;

        let handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();           
            if(isDragAndDropCancelled === false) {
                mousemove(e);
            }
        }

        handleMouseMove = _.throttle(handleMouseMove, 1000 / this.FRAME_RATE, {leading: true, trailing: true});

        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();

            window.removeEventListener("mousemove", handleMouseMove, {capture: true});
            window.removeEventListener("mouseup", handleMouseUp, {capture: true});
            window.removeEventListener("keydown", handleKeyDown, {capture: true});

            if(isDragAndDropCancelled === false) {
                mouseup(e)
            }

            domBlocker.removeFromDOM();
            domBlocker = undefined;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if(e.key === "Escape") {
                isDragAndDropCancelled = true;
                domBlocker.css("cursor", "default");

                e.preventDefault();
            }
        }

        window.addEventListener("mousemove", handleMouseMove, {capture: true});
        window.addEventListener("mouseup", handleMouseUp, {capture: true});
        window.addEventListener("keydown", handleKeyDown, {capture: true});
    }
}
