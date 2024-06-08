import { IPoint, IRect } from "../common/dimensions";
import { DockKind } from "../common/enumerations";
import { PanelContainer } from "../containers/PanelContainer";
import { DockManager } from "../facade/DockManager";
import { Component } from "../framework/Component";
import { ComponentEventSubscription } from "../framework/component-events";
import { DOM } from "../utils/DOM";
import { CollapserHeader } from "./CollapserHeader";
import { AnimationHelper } from "../utils/animation-helper";
import { RectHelper } from "../utils/rect-helper";

import "./Collapser.css";
import { MouseLeaveGuard } from "../utils/mouse-leave-guard";

/**
 * 
 * Collapser Component hiding a PanelContainer sideways
 * 
 * Events:
 *      - onShowPanel - panel is about to be shown
 *      - onHidePanel - panel is about to be hidden
 */
export class Collapser extends Component {

    private domPanelPlaceholder: DOM<HTMLElement>;
    private header: CollapserHeader;

    private titleChangeSubscription: ComponentEventSubscription;
    private mouseLeaveGuard: MouseLeaveGuard;
    private animationRunning: boolean = false;

    constructor(
        private dockManager: DockManager, 
        private panel: PanelContainer, 
        private collapseKind: DockKind,
        private panelRect: IRect
    ) {
        super();
        this.initializeComponent();
        // Append Collapser to DOM
        const domDockContainer = this.dockManager.getContainerElement();
        domDockContainer.appendChild(this.getDOM());
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {
        const headerThickness = this.dockManager.config.collapserMarginSize;
        this.header = new CollapserHeader(this.collapseKind, headerThickness);
        this.dockManager.getCollapserMargin(this.collapseKind).appendHeader(this.header.getDOM());

        this.header.on("onMouseEnter", () => this.showPanel());

        this.titleChangeSubscription = this.panel.on("onTitleChanged", () => this.requestUpdate());
        this.dockManager.getModelContext().appendCollapser(this);
    }

    protected onDisposed(): void {        
        this.dockManager.getModelContext().removeCollapser(this);
        this.titleChangeSubscription.unsubscribe();

        this.dockManager.getCollapserMargin(this.collapseKind).removeHeader(this.header.getDOM());
        this.mouseLeaveGuard?.dispose();
        this.mouseLeaveGuard = undefined;
        this.header.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domPanelPlaceholder = DOM.create("div")
            .addClass("DockerTS-Collapser-Placeholder")
            .hide();

        return this.domPanelPlaceholder.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.header.icon = this.panel.getTitleIcon();
        this.header.title = this.panel.getTitle();
    }

    /**
     * Public API Methods
     */

    public getPanel(): PanelContainer {
        return this.panel;
    }

    public getPanelPlaceholderDOM(): DOM<HTMLElement> {
        return this.domPanelPlaceholder;
    }

    /**
     * Show & Hide Panel Animation Methods
     */

    private async showPanel(): Promise<void> {        
        // Prevent asynchronous requests
        if(this.isPanelVisible() || this.animationRunning)
            return;
        this.animationRunning = true;

        let sourceHiddenRect = this.computePanelHiddenRect();
        let targetVisibleRect = this.computePanelVisibleRect();

        this.triggerEvent("onShowPanel");

        this.domPanelPlaceholder.show().applyRect(sourceHiddenRect);        
        await AnimationHelper.animateShowCollapserPanel(this.domPanelPlaceholder.get(), 
            targetVisibleRect, () => this.panel.updateState());
        this.domPanelPlaceholder.applyRect(targetVisibleRect);
        this.panel.updateState();

        this.mouseLeaveGuard = new MouseLeaveGuard([
            this.domPanelPlaceholder.get(), this.header.getDOM()
        ], () => this.hidePanel());

        this.animationRunning = false;
    }

    private async hidePanel(): Promise<void> {
        // Prevent asynchronous requests
        if(this.animationRunning)
            return;
        this.animationRunning = true;

        this.mouseLeaveGuard.dispose();
        this.mouseLeaveGuard = undefined;

        let targetHiddenRect = this.computePanelHiddenRect();
        await AnimationHelper.animateHideCollapserPanel(this.domPanelPlaceholder.get(), targetHiddenRect,
                () => this.panel.updateState());
        this.triggerEvent("onHidePanel");
        this.domPanelPlaceholder.hide();

        this.animationRunning = false;
    }

    private isPanelVisible(): boolean {
        return this.panel.isHidden() === false;
    }
    
    /**
     * Private Helper Methods for computing visible & hidden target animation rects for the panel
     */

    private computePanelVisibleRect(): IRect {
        const anchorPoint: IPoint = this.getHeaderArchorPosition();
        const slidingSize = this.getSlidingDimensionSize();
        const nonSlidingSize = this.getNonSlidingDimensionSize();

        switch(this.collapseKind) {
            case DockKind.Left:
                return { x: anchorPoint.x, y: anchorPoint.y, w: slidingSize, h: nonSlidingSize };
            case DockKind.Right:
                return { x: anchorPoint.x - slidingSize, y: anchorPoint.y, w: slidingSize, h: nonSlidingSize }
            case DockKind.Down:
                return { x: anchorPoint.x, y: anchorPoint.y - slidingSize, w: nonSlidingSize, h: slidingSize }
        }
    }

    private computePanelHiddenRect(): IRect {
        const anchorPoint: IPoint = this.getHeaderArchorPosition();
        const slidingSize = this.getSlidingDimensionSize();
        const nonSlidingSize = this.getNonSlidingDimensionSize();

        switch(this.collapseKind) {
            case DockKind.Left:
                return { x: anchorPoint.x - slidingSize, y: anchorPoint.y, w: slidingSize, h: nonSlidingSize };
            case DockKind.Right:
                return { x: anchorPoint.x + slidingSize, y: anchorPoint.y, w: slidingSize, h: nonSlidingSize }
            case DockKind.Down:
                return { x: anchorPoint.x, y: anchorPoint.y + slidingSize, w: nonSlidingSize, h: slidingSize }
        }
    }

    private getSlidingDimensionSize(): number {
        const dockContainerBounds = this.dockManager.getContentBoundingRect();
        const slidingDimension = 
            this.collapseKind === DockKind.Down ? this.panelRect.h : this.panelRect.w;
        const windowSlidingDimension = 
            this.collapseKind === DockKind.Down ? dockContainerBounds.h : dockContainerBounds.w;
        const slidingRatio = 
            this.collapseKind === DockKind.Down 
            ? this.dockManager.config.collapserVerticalSlidingRatio
            : this.dockManager.config.collapserHorizontalSlidingRatio;
        return Math.min(slidingDimension, slidingRatio * windowSlidingDimension);
    }

    private getNonSlidingDimensionSize(): number {
        const nonSlidingDimension = 
            this.collapseKind === DockKind.Down ? this.panelRect.w : this.panelRect.h;
        const maxNonSlidingDimension = 
            this.collapseKind === DockKind.Down 
            ? this.dockManager.config.collapserMaxVerticalNonSlidingDim
            : this.dockManager.config.collapserMaxHorizontalNonSlidingDim
        return Math.min(nonSlidingDimension, maxNonSlidingDimension);
    }

    private getHeaderArchorPosition(): IPoint {
        let headerBounds = RectHelper.fromDOMRect(this.header.getDOM().getBoundingClientRect());
        headerBounds = this.dockManager.adjustToFullWindowRelative(headerBounds);
        
        switch(this.collapseKind) {
            case DockKind.Left:
                return {x: headerBounds.x + headerBounds.w, y: headerBounds.y };
            case DockKind.Right:
                return {x: headerBounds.x, y: headerBounds.y };
            case DockKind.Down:
                return {x: headerBounds.x, y: headerBounds.y };
        }
    }
}
