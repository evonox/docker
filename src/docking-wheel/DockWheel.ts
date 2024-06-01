import { DockManager } from "../facade/DockManager";
import { OrientationKind, WheelTypes } from "../common/enumerations";
import { Dialog } from "../floating/Dialog";
import { DockNode } from "../model/DockNode";
import { DOM } from "../utils/DOM";
import { DockWheelItem } from "./DockWheelItem";
import { IPoint, IRect } from "../common/dimensions";
import { AnimationHelper, IAnimation } from "../utils/animation-helper";
import * as _ from "lodash-es";

/**
 * DockWheel - navigation control for docking a floating dialog
 */
export class DockWheel {

    private domMainWheel: DOM<HTMLElement>;
    private domSideWheel: DOM<HTMLElement>;
    private domPanelPreview: DOM<HTMLElement>;
    
    private wheelItems: DockWheelItem[] = [];

    private activeDialog: Dialog;
    private activeNode: DockNode;

    private isVisible: boolean;

    private animation: IAnimation;
    private originalBounds: IRect;
    private originalDragOffset: IPoint;


    constructor(private dockManager: DockManager) {
        this.isVisible = false;
        this.activeDialog = undefined;
        this.activeNode = undefined;

        this.handleWheelMouseEnter = this.handleWheelMouseEnter.bind(this);
        this.handleWheelMouseLeave = this.handleWheelMouseLeave.bind(this);

        this.initialize();
    }

    private initialize() {
        const wheelZIndex = this.dockManager.getWheelZIndex();        
        this.domMainWheel = DOM.create("div").addClass("dock-wheel-base");
        this.domSideWheel = DOM.create("div").addClass("dock-wheel-base");
        this.domPanelPreview = DOM.create("div").addClass("dock-wheel-panel-preview")
            .zIndex(wheelZIndex - 1);

        this.constructWheelItems();
    }

    private constructWheelItems() {
        const zIndexWheelItem = this.dockManager.config.zIndexes.zIndexWheelItem;

        for(const wheelTypeName in WheelTypes) {
            const wheelType: WheelTypes = (<any>WheelTypes)[wheelTypeName];
            const wheelItem = new DockWheelItem(wheelType, zIndexWheelItem);
            wheelItem.on("onMouseEnter", this.handleWheelMouseEnter);
            wheelItem.on("onMouseLeave", this.handleWheelMouseLeave);
            this.wheelItems.push(wheelItem);

            if(wheelItem.isSideWheelItem()) {
                this.domSideWheel.appendChild(wheelItem.getDOM());
            } else {
                this.domMainWheel.appendChild(wheelItem.getDOM());
            }
        }
    }

    setActiveDialog(dialog: Dialog) {
        this.activeDialog = dialog;
    }

    setActiveNode(node: DockNode) {
        if(this.activeNode !== node) {
            this.activeNode = node;

            if(this.isVisible) {
                this.showWheel();
            }
        }
    }

    getActiveNode() {
        return this.activeNode;
    }

    showWheel() {
        this.isVisible = true;

        if(! this.activeNode) {
            this.domMainWheel.removeFromDOM();
            this.domSideWheel.removeFromDOM();
        } else {
            // Compute position of the main wheel
            const domContainer = this.activeNode.container.getDOM();
            const containerBounds = domContainer.getBoundingClientRect();
            const middlePoint: IPoint = {
                x: containerBounds.x + containerBounds.width / 2,
                y: containerBounds.y + containerBounds.height / 2
            };
            this.domMainWheel.left(middlePoint.x).top(middlePoint.y);

            const domDockerContainer = this.dockManager.getContainerElement();
            this.domMainWheel.appendTo(domDockerContainer);
            this.domSideWheel.appendTo(domDockerContainer);

            // Compute position of sidewheels
            const sideWheelMargin = this.dockManager.config.sideWheelMargin;
            const boundsDockContainer = this.dockManager.getContainerBoundingRect();
            const dockerWidth = boundsDockContainer.width;
            const dockerHeight = boundsDockContainer.height;

            this.setWheelButtonPosition(WheelTypes.SideLeft, sideWheelMargin, dockerHeight / 2);
            this.setWheelButtonPosition(WheelTypes.SideRight, dockerWidth - sideWheelMargin, dockerHeight / 2 )
            this.setWheelButtonPosition(WheelTypes.SideTop, dockerWidth / 2, sideWheelMargin);
            this.setWheelButtonPosition(WheelTypes.SideBottom, dockerWidth / 2, dockerHeight - sideWheelMargin);
        }
    }

    private setWheelButtonPosition(wheelType: WheelTypes, left: number, top: number) {
        const wheelItem = this.wheelItems.find(wi => wi.getWheelType() === wheelType);
        const domWheelItem = wheelItem.getDOM();
        const domBounds = domWheelItem.getBoundingClientRect();
        const wheelItemPoint: IPoint = {
            x: left - domBounds.width / 2,
            y: top - domBounds.height / 2
        }
        DOM.from(domWheelItem).left(wheelItemPoint.x).top(wheelItemPoint.y)
            .css("margin-left", "0").css("margin-top", "0");
    }

    hideWheel() {
        this.isVisible = false;
        this.activeNode = undefined;

        this.domMainWheel.removeFromDOM();
        this.domSideWheel.removeFromDOM();
        this.domPanelPreview.removeFromDOM();

        this.wheelItems.forEach(wheelItem => wheelItem.active = false);
        this.previewOff = true;
    }

    onDialogDropped(dialog: Dialog) {
    }

    private handleWheelMouseEnter(payload: {wheelItem: DockWheelItem, event: MouseEvent}) {
        if(! this.activeDialog)
            return;

        const { wheelItem, event } = payload;
 
        const activePanel = this.activeDialog.getPanel();
        if(activePanel && this.activeNode) {
            this.removeDOMPreviewDbc.cancel();

            this.animation?.cancel();
            if(this.previewOff) {
                this.previewOff = false;
                this.originalBounds = DOM.from(this.activeDialog.getDialogFrameDOM()).getComputedRect();
                this.domPanelPreview.css("opacity", "").applyRect(this.originalBounds).appendTo(this.dockManager.getContainerElement());   
            }
            this.domPanelPreview.css("opacity", "");

            const bounds = this.queryDockingBounds(wheelItem);            
            this.animation = AnimationHelper.animateDockWheelPlaceholder(this.domPanelPreview.get(), bounds);
        }
    }

    private handleWheelMouseLeave(payload: {wheelItem: DockWheelItem, event: MouseEvent}) {        
        this.removeDOMPreviewDbc()
    }

    private previewOff: boolean = true;
    private removeDOMPreviewDbc = _.debounce(this.removeDOMPreview, 350, {leading: false, trailing: true});

    private removeDOMPreview() {
        AnimationHelper.animateFadeOut(this.domPanelPreview.get()).then(() => {
            this.domPanelPreview.removeFromDOM();
            this.previewOff = true;   
        })
    }

    private queryDockingBounds(wheelItem: DockWheelItem): IRect {
        const rootNode = this.dockManager.getModelContext().model.rootNode;
        switch(wheelItem.getWheelType()) {
            case WheelTypes.Top:
                return this.dockManager.getLayoutEngine().getDockBounds(this.activeNode, 
                        this.activeDialog.getPanel(), OrientationKind.Column, true);
            case WheelTypes.Bottom:
                return this.dockManager.getLayoutEngine().getDockBounds(this.activeNode, 
                    this.activeDialog.getPanel(), OrientationKind.Column, false);
            case WheelTypes.Left: 
                return this.dockManager.getLayoutEngine().getDockBounds(this.activeNode, 
                    this.activeDialog.getPanel(), OrientationKind.Row, true);
            case WheelTypes.Right:
                return this.dockManager.getLayoutEngine().getDockBounds(this.activeNode, 
                    this.activeDialog.getPanel(), OrientationKind.Row, false);
            case WheelTypes.Fill:
                return this.dockManager.getLayoutEngine().getDockBounds(this.activeNode, 
                    this.activeDialog.getPanel(), OrientationKind.Fill, false);
            case WheelTypes.SideTop:
                return this.dockManager.getLayoutEngine().getDockBounds(rootNode, 
                    this.activeDialog.getPanel(), OrientationKind.Column, true);
            case WheelTypes.SideBottom:
                return this.dockManager.getLayoutEngine().getDockBounds(rootNode, 
                    this.activeDialog.getPanel(), OrientationKind.Column, false);
            case WheelTypes.SideLeft:
                return this.dockManager.getLayoutEngine().getDockBounds(rootNode, 
                    this.activeDialog.getPanel(), OrientationKind.Row, true);
            case WheelTypes.SideRight:
                return this.dockManager.getLayoutEngine().getDockBounds(rootNode, 
                    this.activeDialog.getPanel(), OrientationKind.Row, false);
        }
    }
    
    private positionDockPlaceholder(rect: IRect) {
        const domNode = this.dockManager.getContainerElement();
    }
 
    private handleDockRequest(wheelType: WheelTypes, dialog: Dialog) {

    }
}