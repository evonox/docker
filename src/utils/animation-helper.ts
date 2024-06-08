import { IRect } from "../common/dimensions";
import { animate } from "../animation/animation";

export interface IAnimation {
    commit(): void;
    cancel(): void;
}


export class AnimationHelper {

    static animateFadeOut(target: HTMLElement): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            animate(target, {opacity: 0}, {
                easing: "linear",
                duration: 300,
                complete: () => resolve()
            })
        });
    }

    static animateDockWheelPlaceholder(target: HTMLElement, rect: IRect): IAnimation {
        const animation = animate(target, {left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: 1}, {
            easing: "linear",
            duration: 250,
        });
        return {
            commit: () => animation.finish(),
            cancel: () => animation.cancel()
        }
    }


    static animateTabReorderTranslation(target: HTMLElement, targetLeftCoordinate: number): IAnimation {
        let isAnimationRunning = true;
        let sourceLeftCoordinate: number = parseFloat(target.style.left);

        const animation = animate(target, {left: targetLeftCoordinate}, {
            duration: 150,
            easing: "easeInOut",
            complete: () => isAnimationRunning = false
        });

        return {
            commit: () => {
                if(isAnimationRunning) {
                    isAnimationRunning = false;
                    animation.cancel();
                    target.style.left = targetLeftCoordinate.toFixed(3) + "px";
                }
            },
            cancel: () => {
                if(isAnimationRunning) {
                    isAnimationRunning = false;
                    animation.cancel();
                    target.style.left = sourceLeftCoordinate.toFixed(3) + "px";
                }
            }
        }
    }

    static async animatePanelCollapse(domDialog: HTMLElement, domContent: HTMLElement, headerHeight: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            animate(domDialog, {height: headerHeight}, {
                duration: 250,
                easing: "easeInSine",
                complete: () => resolve()
            });
            animate(domContent, {height: 0}, {
                duration: 250,
                easing: "easeInSine",
                complete: () => resolve()
            });
        });
    }

    static async animatePanelExpand(domDialog: HTMLElement, domContent: HTMLElement, dialogHeight: number, contentHeight: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            animate(domDialog, {height: dialogHeight}, {
                duration: 400,
                easing: "easeOutCubic",
                complete: () => resolve()
            });
            animate(domContent, {height: contentHeight}, {
                duration: 400,
                easing: "easeOutCubic",
                complete: () => resolve()
            });
        });
    }



    static async animateMaximize(targetElement: HTMLElement, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            animate(targetElement, 
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
            animate(targetElement, 
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
            animate(headerElement, {height: headerHeight}, {
                duration: 100,
                easing: 'linear',
                complete: () => {
                    animate(targetElement, 
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
            animate(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 350,
                    easing: "easeInOutCubic",
                    complete: () => {
                        animate(headerElement, {height: 0}, {
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

    static async animateMinimize(targetElement: HTMLElement, targetRect: IRect): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            animate(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 450,
                    easing: "easeInOutCubic",
                    complete: () => resolve()
                }
            );
        });       
    }

    static async animateDialogMove(targetElement: HTMLElement, targetLeft: number, targetTop: number, progress: () => void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            animate(targetElement, 
                {left: targetLeft, top: targetTop},
                {
                    duration: 250,
                    easing: "easeInOutCubic",
                    progress: () => progress(),
                    complete: () => resolve()
                }
            );
        });       
    }

    static async animateCollapserMargin(targetElement: HTMLElement, propertyName: string, targetValue: number) {
        return new Promise<void>((resolve, reject) => {
            animate(targetElement, 
                {[propertyName]: targetValue},
                {
                    duration: 350,
                    easing: "linear",
                    complete: () => resolve()
                }
            );
        });       
    }

    static async animateShowCollapserPanel(targetElement: HTMLElement, targetRect: IRect, progress: () => void) {
        return new Promise<void>((resolve, reject) => {
            animate(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 500,
                    easing: "linear",
                    progress: () => progress(),
                    complete: () => resolve()
                }
            );
        });       
    }

    static async animateHideCollapserPanel(targetElement: HTMLElement, targetRect: IRect, progress: () => void) {
        return new Promise<void>((resolve, reject) => {
            animate(targetElement, 
                {left: targetRect.x, top: targetRect.y, width: targetRect.w, height: targetRect.h},
                {
                    duration: 500,
                    easing: "linear",
                    progress: () => progress(),
                    complete: () => resolve()
                }
            );
        });       
    }
}
