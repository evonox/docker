import "velocity-animate";
import { IRect } from "../common/dimensions";
import { PanelContainer } from "../containers/PanelContainer";

declare var Velocity: any;

export interface IAnimation {
    commit(): void;
    cancel(): void;
}


export class AnimationHelper {

    static animateFadeOut(target: HTMLElement): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(target, {opacity: 0}, {
                duration: 300,
                complete: () => resolve()
            })
        });
    }

    static animateDockWheelPlaceholder(target: HTMLElement, rect: IRect): IAnimation {
        Velocity(target, {left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: 1}, {
            duration: 250,
        });
        return {
            commit: () => {
                Velocity(target, "finish")
            },
            cancel: () => Velocity(target, "stop")
        }
    }


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

    static async animatePanelCollapse(domDialog: HTMLElement, domContent: HTMLElement, headerHeight: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(domDialog, {height: headerHeight}, {
                duration: 250,
                easing: "easeInSine",
                complete: () => resolve()
            });
            Velocity(domContent, {height: 0, opacity: 0}, {
                duration: 250,
                easing: "easeInSine",
                complete: () => resolve()
            });
        });
    }

    static async animatePanelExpand(domDialog: HTMLElement, domContent: HTMLElement, dialogHeight: number, contentHeight: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(domDialog, {height: dialogHeight}, {
                duration: 400,
                easing: "easeOutCubic",
                complete: () => resolve()
            });
            Velocity(domContent, {height: contentHeight, opacity: 1}, {
                duration: 400,
                easing: "easeOutCubic",
                complete: () => resolve()
            });
        });
    }



    static async animateMaximize(targetElement: HTMLElement, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 350,
                    easing: "easeInOutCubic",
                    complete: () => resolve()
                }
            );
        });
    }

    static async animateRestore(targetElement: HTMLElement, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 350,
                    easing: "easeInOutCubic",
                    complete: () => resolve()
                }
            );
        });       
    }

    static async animateMaximizeNoHeader(targetElement: HTMLElement, headerElement: HTMLElement, headerHeight: number, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(headerElement, {height: headerHeight}, {
                duration: 100,
                easing: 'linear',
                complete: () => {
                    Velocity(targetElement, 
                        {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                        {
                            delay: 100,
                            duration: 350,
                            easing: "easeInOutCubic",
                            complete: () => resolve(),
                        }
                    );
                }
            });
        });
    }


    static async animateRestoreNoHeader(targetElement: HTMLElement, headerElement: HTMLElement, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Velocity(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 350,
                    easing: "easeInOutCubic",
                    complete: () => {
                        Velocity(headerElement, {height: 0}, {
                            delay: 100,
                            duration: 100,
                            easing: 'linear',
                            complete: () => resolve()
                        })           
                    }
                }
            );
        });       
    }
}
