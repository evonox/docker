import { IPoint, IRect } from "../common/dimensions";
import { DockKind } from "../common/enumerations";
import { PanelContainer } from "../containers/PanelContainer";
import { DockManager } from "../facade/DockManager";
import { Component } from "../framework/Component";
import { ComponentEventSubscription } from "../framework/component-events";
import { DOM } from "../utils/DOM";
import { CollapserHeader } from "./CollapserHeader";

import "./Collapser.css";
import { AnimationHelper } from "../utils/animation-helper";
import { RectHelper } from "../utils/rect-helper";

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

    constructor(
        private dockManager: DockManager, 
        private panel: PanelContainer, 
        private collapseKind: DockKind
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
        this.header.on("onMouseLeave", () => this.hidePanel());

        this.titleChangeSubscription = this.panel.on("onTitleChanged", () => this.requestUpdate());
        this.dockManager.getModelContext().appendCollapser(this);
    }

    protected onDisposed(): void {
        this.dockManager.getModelContext().removeCollapser(this);
        this.titleChangeSubscription.unsubscribe();

        this.dockManager.getCollapserMargin(this.collapseKind).removeHeader(this.header.getDOM());
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

    public getPanelPlaceholderDOM(): DOM<HTMLElement> {
        return this.domPanelPlaceholder;
    }

    /**
     * Show & Hide Panel Animation Methods
     */

    private async showPanel(): Promise<void> {
        const sourceHiddenRect = this.computePanelHiddenRect();
        const targetVisibleRect = this.computePanelVisibleRect();

        this.domPanelPlaceholder.show().applyRect(sourceHiddenRect);        
        this.triggerEvent("onShowPanel");
        await AnimationHelper.animateShowCollapserPanel(this.domPanelPlaceholder.get(), targetVisibleRect);
        this.domPanelPlaceholder.applyRect(targetVisibleRect);
    }

    private async hidePanel(): Promise<void> {
        const targetHiddenRect = this.computePanelHiddenRect();
        await AnimationHelper.animateHideCollapserPanel(this.domPanelPlaceholder.get(), targetHiddenRect);
        this.triggerEvent("onHidePanel");
        this.domPanelPlaceholder.hide();
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
        const nonSlidingSize = this.getNonSlidingDimensionSize();

        switch(this.collapseKind) {
            case DockKind.Left:
                return { x: anchorPoint.x, y: anchorPoint.y, w: 0, h: nonSlidingSize };
            case DockKind.Right:
                return { x: anchorPoint.x, y: anchorPoint.y, w: 0, h: nonSlidingSize }
            case DockKind.Down:
                return { x: anchorPoint.x, y: anchorPoint.y, w: 0, h: nonSlidingSize }
        }
    }

    private getSlidingDimensionSize(): number {
        const dockContainerBounds = this.dockManager.getContentBoundingRect();
        const slidingDimension = 
            this.collapseKind === DockKind.Down ? this.panel.getHeight() : this.panel.getWidth();
        const windowSlidingDimension = 
            this.collapseKind === DockKind.Down ? dockContainerBounds.h : dockContainerBounds.w;
        return Math.min(slidingDimension, this.dockManager.config.collapserSlidingDimRatio * windowSlidingDimension);
    }

    private getNonSlidingDimensionSize(): number {
        const nonSlidingDimension = 
            this.collapseKind === DockKind.Down ? this.panel.getWidth() : this.panel.getHeight();
        return Math.min(nonSlidingDimension, this.dockManager.config.collapserMaxNonSlidingDim);
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
