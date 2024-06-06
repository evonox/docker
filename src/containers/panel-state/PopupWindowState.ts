import { BrowserPopupHelper } from "../../utils/browser-popup-helper";
import { PanelStateBase } from "./PanelStateBase";

/**
 * State Active when the panel is in popup window
 */
export class PopupWindowState extends PanelStateBase {

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);
        this.configureButtons({
            maximize: false, minimize: false, expand: false, collapse: false, restore: false, popup: false
        });
        this.panel.enableDefaultContextMenu(false);

        this.undockPanel();
        this.panel.updateState();

        setTimeout(() => {
            this.openWindowInPopup();
        });
    }

    public async leaveState(): Promise<void> {
        await super.leaveState();
    }

    private undockPanel() {
        this.dockManager.requestUndock(this.panel);
    }

    private openWindowInPopup() {
        const targetElement = this.panel.getContentFrameDOM();
        
        BrowserPopupHelper.showElementInBrowserWindow(targetElement.get(), {
            title: this.panel.getTitle(),
            windowOffset: {
                x: 0,
                y: 0
            },
            onPopupWindowClosed: () => this.panel.close()
        })
    }

    updateState(): void {
        super.updateState();
        console.log("UPDATE STATE");

    }
}