import { IPoint, OverlayHelper } from "./overlay-helper";

export interface IOverlayPosition {
    at: string;
    my: string;
}

export type IOverlayAutoPosition = IOverlayPosition[];

// The sequence of positions checked, first visible position wins
const AUTOMATIC_MY_POSITIONS: IOverlayAutoPosition = [
    {at: "", my: "left, top"},
    {at: "", my: "left, bottom"},
    {at: "", my: "right, bottom"},
    {at: "", my: "right, top"}
]

export class AutoPositioningHelper {
   
    static computeAutomaticallyOverlayPosition(overlay: HTMLElement, anchor: IPoint): IPoint {
        // To check the overlay is in viewport, add it to <body>
        document.body.appendChild(overlay);

        let finalPoint: IPoint;
        for(const position of AUTOMATIC_MY_POSITIONS) {
            finalPoint = OverlayHelper.computeFinalOverlayPosition(anchor, overlay, position.my);
            if(this.isOverlayInViewport(overlay, finalPoint))
                break;
        }
        // Cleanup
        overlay.remove();
        return finalPoint;
    }

    /**
     * Checks whether overlay (e.g. context menu) is visible in viewport
     */
    private static isOverlayInViewport(overlay: HTMLElement, position: IPoint): boolean {
        // Place overlay
        overlay.style.setProperty("left", String(position.x) + "px");
        overlay.style.setProperty("top", String(position.y) + "px");
        
        // Get computed bounds        
        const overlayBounds = overlay.getBoundingClientRect();
        
        // Cleaup to position
        overlay.style.setProperty("left", "");
        overlay.style.setProperty("top", "");

        // Check window boundaries
        return overlayBounds.left > 0 
                && overlayBounds.top > 0 
                && overlayBounds.right < window.innerWidth 
                && overlayBounds.bottom < window.innerHeight;
    }
}
