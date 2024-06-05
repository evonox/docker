import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { DOMUpdateInitiator } from "../../utils/DOMUpdateInitiator";
import { AnimationHelper } from "../../utils/animation-helper";
import { TransitionBase } from "./TransitionBase";

/**
 * Transition for animation to the maximized state
 */
export class MaximizeAnimationTransition extends TransitionBase {

    async trigger(): Promise<void> {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.addClass("DockerTS-ContentFrame--Animating");
        if(this.panel.isHeaderVisible()) {
            await this.animateWithHeaderVisible();
        } else {
            await this.animateWithHeaderShowing();
        }
        domContentFrame.removeClass("DockerTS-ContentFrame--Animating");
    }

    private async animateWithHeaderShowing() {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel);
        this.panel.updateState();

        const containerRect = this.dockManager.getContainerBoundingRect();
        
        // Get the initial header height for the animation purposes
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        const height = domFrameHeader.getOffsetRect().h;
        this.panel.setHeaderVisibility(true);
        domFrameHeader.height(0);        
        // Note: we need to force all updates - reason: we need to animate the height of the frame header
        DOMUpdateInitiator.forceEnqueuedDOMUpdates();

        await AnimationHelper.animateMaximizeNoHeader(domContentFrame.get(), domFrameHeader.get(), height, {
            x: containerRect.left, y: containerRect.top, w: containerRect.width, h: containerRect.height
        });
        
        // Remove element CSS property value for the height
        domFrameHeader.height("");
        domContentFrame.applyRect(containerRect);
        this.panel.updateState();
    }

    private async animateWithHeaderVisible() {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel);
        this.panel.updateState();

        const containerRect = this.dockManager.getContainerBoundingRect();

        await AnimationHelper.animateMaximize(domContentFrame.get(), {
            x: containerRect.left, y: containerRect.top, w: containerRect.width, h: containerRect.height
        });

        domContentFrame.applyRect(containerRect);
    }
}

/**
 * Transition for animation to restore state (Floating State)
 */
export class RestoreAnimationTransition extends TransitionBase {

    async trigger(): Promise<void> {
        const domContentFrame = this.panel.getContentFrameDOM();       
        domContentFrame
            .zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)
            .addClass("DockerTS-ContentFrame--Animating");
        this.panel.updateState();

        const previousState = this.config.get("restoreState");
        let targetRect: IRect = this.config.get("originalRect");
        if(previousState === PanelContainerState.Docked) {
            targetRect = this.panel.getPlaceholderDOM().getBoundsRect();
        }
        const wasHeaderVisible = this.config.get("wasHeaderVisible", true);
        
        if(previousState === PanelContainerState.Docked) {
            if(wasHeaderVisible === false) {
                const domHeader = this.panel.getFrameHeaderDOM();
                await AnimationHelper.animateRestoreNoHeader(domContentFrame.get(), domHeader.get(), targetRect);;
                domHeader.height("");   
            } else {
                await AnimationHelper.animateRestore(domContentFrame.get(), targetRect);
            }
        } else {
            await AnimationHelper.animateRestore(domContentFrame.get(), targetRect);
        }
        // TODO: WILL ANIMATION LIBRARY CLENAUP AFTER ITSELF OR NOT???
        domContentFrame.applyRect(targetRect).removeClass("DockerTS-ContentFrame--Animating").zIndex("");
        this.panel.updateState();
    }
}

/**
 * Transition for animating minimization
 */
export class MinimizeAnimationTransition extends TransitionBase {

    async trigger(): Promise<void> {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame
            .zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)
            .addClass("DockerTS-ContentFrame--Animating");
        this.panel.updateState();

        const minimizedFreeSlot = this.dockManager.getNextFreeMinimizedSlotRect();
        await AnimationHelper.animateMinimize(domContentFrame.get(), minimizedFreeSlot);

        domContentFrame.applyRect(minimizedFreeSlot).removeClass("DockerTS-ContentFrame--Animating").zIndex("");
        this.panel.updateState();
    }
}

/**
 * When we do not need to do anything in the transition
 */
export class NoActionTransition extends TransitionBase {
    async trigger(): Promise<void> {}   
}
