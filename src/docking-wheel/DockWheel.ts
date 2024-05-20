import { DockManager } from "../facade/DockManager";
import { IRect, WheelTypes } from "../common/declarations";
import { Dialog } from "../floating/Dialog";
import { DockNode } from "../model/DockNode";
import { DOM } from "../utils/DOM";
import { DockWheelItem } from "./DockWheelItem";


export class DockWheel {

    private domMainWheel: DOM<HTMLElement>;
    private domSideWheel: DOM<HTMLElement>;
    private domPanelPreview: DOM<HTMLElement>;
    
    private wheelItems: DockWheelItem[] = [];

    private activeDialog: Dialog;
    private activeNode: DockNode;

    private isVisible: boolean;

    constructor(private dockManager: DockManager) {
        this.isVisible = false;
        this.activeDialog = undefined;
        this.activeNode = undefined;

        this.initialize();
    }

    private initialize() {
        const wheelZIndex = this.dockManager.getWheelZIndex();        
        this.domMainWheel = DOM.create("div").addClass("dock-wheel-base")
            .css("zIndex", String(wheelZIndex + 1));
        this.domSideWheel = DOM.create("div").addClass("dock-wheel-base")
            .css("zIndex", String(wheelZIndex));
        this.domPanelPreview = DOM.create("div").addClass("dock-wheel-panel-preview")
            .css("zIndex", String(wheelZIndex - 1));

        this.constructWheelItems();
    }

    private constructWheelItems() {
        for(const wheelTypeName in WheelTypes) {
            const wheelType = <WheelTypes>wheelTypeName;
            const wheelItem = new DockWheelItem(wheelType);
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
            /*****
             *  COMPLEX POSITIONING ALGORITHM - REFACTOR
             */
        }
    }

    hideWheel() {
        this.isVisible = false;
        this.activeNode = undefined;

        this.domMainWheel.removeFromDOM();
        this.domSideWheel.removeFromDOM();
        this.domPanelPreview.removeFromDOM();

        this.wheelItems.forEach(wheelItem => wheelItem.active = false);
    }

    onDialogDropped(dialog: Dialog) {

    }

    private handleWheelMouseOver(wheelItem: DockWheelItem) {
        if(! this.activeDialog)
            return;
        const rootNode = this.dockManager.getModelContext().model.rootNode;
        const activePanel = this.activeDialog.getPanel();


    }

    private handleWheelMouseOut(wheelItem: DockWheelItem) {
        this.domPanelPreview.removeFromDOM();
    }

    private queryDockingBounds(wheelItem: DockWheelItem) {

    }
    
    private positionDockPlaceholder(rect: IRect) {

    }

    private getActiveWheelItem(): DockWheelItem {
        throw 0;
    }

    private handleDockRequest(wheelType: WheelTypes, dialog: Dialog) {

    }
}