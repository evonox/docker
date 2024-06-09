import { MathHelper } from "../utils/math-helper";
import { IAnimatedProps, IAnimationAPI, IAnimationOptions } from "./animation-api";
import { Easings } from "./easing-functions/easings";
import { VelocityEasingFn } from "./easing-functions/types";
import "./easing-functions/bezier";

const DIMENSION_PROPERTIES = ["left", "top", "right", "bottom", "width", "height"];

/**
 * The main animation class 
 */
class Animation implements IAnimationAPI {

    private cssSourceState: IAnimatedProps;
    private zeroTime: number;
    private easingFn: VelocityEasingFn;
    private handleRAF: number = 0;

    constructor(
        private element: HTMLElement, 
        private cssTargetState: IAnimatedProps, 
        private options: IAnimationOptions
    ) {
        this.animationTick = this.animationTick.bind(this);
        // Check, if there is specified a delay, in case it is, wait the given number of milliseconds
        if(options.delay === undefined) {
            this.startAnimation();
        } else {
            setTimeout(() => this.startAnimation(), options.delay);
        }
    }

    // Starts the animation
    private startAnimation() {
        // Captures the start state
        this.captureStartValues();
        // Sets the initial values
        this.easingFn = Easings[this.options.easing];
        if(this.easingFn === undefined)
            throw new Error(`Easing function ${this.options.easing} as not found.`);
        // Invoke the begin handler
        this.options.begin?.();
        // Request the RAF
        this.zeroTime = document.timeline.currentTime as number;
        this.handleRAF = window.requestAnimationFrame(this.animationTick);
    }

    private captureStartValues() {
        const computedStyle = window.getComputedStyle(this.element);
        this.cssSourceState = {};
        for(const propertyName in this.cssTargetState) {
            this.cssSourceState[propertyName] = parseFloat(computedStyle.getPropertyValue(propertyName));
        }
    }

    private applyFrameStyle(animProps: IAnimatedProps) {
        for(const propertyName in animProps) {
            const propertyValue = animProps[propertyName];
            if(DIMENSION_PROPERTIES.includes(propertyName)) {
                this.element.style.setProperty(propertyName, MathHelper.toPX(propertyValue));
            } else {
                this.element.style.setProperty(propertyName, propertyValue.toFixed(3));
            }
        }
    }

    private animationTick(timestamp: number) {
        const elapsed = (timestamp - this.zeroTime) / this.options.duration;
        if(elapsed < 1) {
            const cssCurrentFrame = this.computeNewFrameValues(elapsed);
            this.applyFrameStyle(cssCurrentFrame);
            this.options.progress?.();
            this.handleRAF = window.requestAnimationFrame(this.animationTick);
        } else {
            this.applyFrameStyle(this.cssTargetState);
            this.options.complete?.();
            if(this.options.restoreValues === true) {
                this.applyFrameStyle(this.cssSourceState);
            }
        }
    }

    private computeNewFrameValues(elapsed: number): IAnimatedProps {
        const currentFrame: IAnimatedProps = {};
        for(const propertyName in this.cssTargetState) {
            const start = this.cssSourceState[propertyName];
            const end = this.cssTargetState[propertyName];
            const value = this.easingFn(elapsed, start, end);
            currentFrame[propertyName] = value;
        }
        return currentFrame;
    }


    cancel(): void {
        // Just cancel the next RAF
        if(this.handleRAF !== 0) {
            window.cancelAnimationFrame(this.handleRAF);
            this.handleRAF = 0;   
        }
    }

    finish(): void {
        // Cancel the next RAF
        if(this.handleRAF !== 0) {
            window.cancelAnimationFrame(this.handleRAF);
            this.handleRAF = 0;   
        }
        // Apply the target state
        this.applyFrameStyle(this.cssTargetState);
    }
}


/**
 *  Main public animation API function
 */
export function animate(
    element: HTMLElement, 
    animProps: IAnimatedProps, 
    options: IAnimationOptions
): IAnimationAPI {
    return new Animation(element, animProps, options);
}
