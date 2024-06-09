import { IDockInfo } from "../../common/declarations";
import { IRect } from "../../common/dimensions";
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

        this.panel.enableDefaultContextMenu(true);

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

        // Compute the new window position and dimensions
        const windowRect = this.computePopupWindowRect(targetElement.get());
                this.popupWindow = BrowserPopupHelper.showElementInBrowserWindow(targetElement.get(), dependentElements, {
            title: this.panel.getTitle(),
            windowRect: windowRect,
            onPopupWindowClosed: () => this.panel.hidePopupWindow()
        })
    }

    private computePopupWindowRect(targetElement: HTMLElement): IRect {
        // Get configuration and popup window sizing options
        const popupWindowOpts = this.dockManager.config.popupWindows;
        const targetBounds = targetElement.getBoundingClientRect();

        // Constrain window width in min-max range
        const windowWidth = Math.min(
            Math.max(targetBounds.width, popupWindowOpts.minWindowWidth),
            popupWindowOpts.maxWindowWidth
        )
        // Constrain window height in min-max range
        const windowHeight = Math.min(
            Math.max(targetBounds.height, popupWindowOpts.minWindowHeight),
            popupWindowOpts.maxWindowHeight
        )

        // Construct the window positioning rect
        const windowBounds: IRect = {
            x: targetBounds.left + popupWindowOpts.windowOffsetX + window.screenX + window.outerWidth - window.innerWidth,
            y: targetBounds.top + popupWindowOpts.windowOffsetY + window.screenY + window.outerHeight - window.innerHeight,
            w: windowWidth,
            h: windowHeight
        };
        return windowBounds;
    }
}
