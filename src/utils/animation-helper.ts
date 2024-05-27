import "velocity-animate";
import { IRect } from "../common/dimensions";
import { PanelContainer } from "../containers/PanelContainer";

declare var Velocity: any;

export interface IAnimation {
    commit(): void;
    cancel(): void;
}


export class AnimationHelper {

    static animateTabReorderTranslation(target: HTMLElement, targetLeftCoordinate: number): IAnimation {
        let isAnimationRunning = true;
        let sourceLeftCoordinate: number = parseFloat(target.style.left);

        Velocity(target, {left: targetLeftCoordinate}, {
            duration: 150,
            easing: "ease-in-out",
            complete: () => isAnimationRunning = false
        });

        return {
            commit: () => {
                if(isAnimationRunning) {
                    isAnimationRunning = false;
                    Velocity(target, "stop")
                    target.style.left = targetLeftCoordinate.toFixed(3) + "px";
                }
            },
            cancel: () => {
                if(isAnimationRunning) {
                    isAnimationRunning = false;
                    Velocity(target, "stop")
                    target.style.left = sourceLeftCoordinate.toFixed(3) + "px";
                }
            }
        }
    }

    static async animateMaximize(container: PanelContainer, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(container.getContentFrameDOM(), 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                500,
                {
                    duration: 500,
                    easing: "ease-in-out",
                    complete: () => resolve()
                }
            );

            

        // // Animate panel maximization 
        // this.setHeaderVisibility(true);
        // //this.domFrameHeader.css("opacity", "0");
        // this.domContentFrame.top(this.domContentFrame.getTop() - this.domFrameHeader.getHeight())
            // header.style.opacity = "0";

            // Velocity(header, {opacity: 1}, {
            //     duration: 3000, 
            //     complete: () => header.style.opacity = "1"
            // });


        });
    }
}
