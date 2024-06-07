import { IDockInfo } from "../../common/declarations";
import { DockKind } from "../../common/enumerations";
import { DockNode } from "../../model/DockNode";
import { AutoDockHelper, IAutoDock } from "../../utils/auto-dock-helper";
import { BrowserPopupHelper } from "../../utils/browser-popup-helper";
import { PanelContainer } from "../PanelContainer";
import { PanelStateBase } from "./PanelStateBase";

/**
 * State Active when the panel is in popup window
 */
export class PopupWindowState extends PanelStateBase {

    private popupWindow: Window;
    private autoDock: IAutoDock;
    private adoptedPopupElements: HTMLElement[] = [];

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);
        this.configureButtons({
            maximize: false, minimize: false, expand: false, collapse: false, restore: false, popup: false, pin: false
        });
        this.panel.enableDefaultContextMenu(false);

        this.autoDock = AutoDockHelper.scanDockInfo(this.dockManager, this.panel);
        this.undockPanel();
        this.panel.updateState();

        // TODO: WHY THIS???
        setTimeout(() => {
            this.openWindowInPopup();
        });
    }

    public async leaveState(): Promise<void> {
        // Perform clean up
        this.autoDock.dispose();
        this.adoptedPopupElements = [];
        this.popupWindow = undefined;

        await super.leaveState();
    }

    async hidePopup(): Promise<boolean> {
        // Adopt the elements back the main DOM Document
        this.adoptedPopupElements.forEach(element => {
            element = document.adoptNode(element);
            document.body.appendChild(element);
        })
        // Close the popup window
        this.popupWindow.close();
        // Restore the docking state & perform updates
        this.autoDock.restoreDock();
        this.panel.activatePanel();
        this.panel.updateState();

        return true;
    }

    updateState(): void {
        super.updateState();
    }

    private undockPanel() {
        this.dockManager.requestUndock(this.panel);
    }

    private openWindowInPopup() {
        const targetElement = this.panel.getContentFrameDOM();
        const nestedContainers = this.panel.getChildContainers();
        const dependentElements = nestedContainers.map(container => {            
            return (container as PanelContainer).getContentFrameDOM().get();
        });
        this.adoptedPopupElements = [targetElement.get()].concat(dependentElements);
        
        this.popupWindow = BrowserPopupHelper.showElementInBrowserWindow(targetElement.get(), dependentElements, {
            title: this.panel.getTitle(),
            windowOffset: {
                x: 0,
                y: 0
            },
            onPopupWindowClosed: () => this.panel.hidePopupWindow()
        })
    }
}
