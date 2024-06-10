import { DockManager } from "../docking-library";
import { ButtonBar } from "./ButtonBar";
import { PANEL_DEFAULT_BUTTONS } from "./panel-default-buttons";

import "./PanelButtonBar.css";

/**
 * Class managing the Button Bar in a panel's header
 */
export class PanelButtonBar extends ButtonBar {

    // private domButtonBar: DOM<HTMLElement>;
    // private iconButtons: IconButton[] = [];

    // @property({defaultValue: true})
    // visible: boolean;

    constructor(dockeManager: DockManager) {
        super(dockeManager);
        // this.handleActionTriggered = this.handleActionTriggered.bind(this)
        // this.initializeComponent();
    }

    // appendUserButton(button: IHeaderButton) {
    //     if(isPanelDefaultAction(button.actionName))
    //         throw new Error(`ERROR: Action name ${button.actionName} is a reserved name.`);
    //     const iconButton = this.constructButtonFromConfig(button);
    //     this.iconButtons.push(iconButton);
    //     this.updateButtonsInDOM();
    // }

    // removeUserButton(actionName: string) {
    //     if(isPanelDefaultAction(actionName))
    //         throw new Error("ERROR: Cannot remove default panel button.");

    //     const iconButton = this.getIconButtonByAction(actionName);
    //     iconButton.dispose();
    //     const index = this.iconButtons.indexOf(iconButton);
    //     if(index >= 0) {
    //         this.iconButtons.splice(index, 1);
    //     }
    // }

    // allowAction(actionName: string) {
    //     this.getIconButtonByAction(actionName).visible = true;
    // }

    // denyAction(actionName: string) {
    //     this.getIconButtonByAction(actionName).visible = false;
    // }

    protected onInitialized(): void {
        for(const defaultBtnConfig of PANEL_DEFAULT_BUTTONS) {
            const iconButton = this.constructButtonFromConfig(defaultBtnConfig);
            this.iconButtons.push(iconButton);
        }
    }

    // protected onDisposed(): void {
    //     for(const iconButton of this.iconButtons) {
    //         iconButton.dispose();
    //     }
    //     this.iconButtons = [];
    // }

    // protected onInitialRender(): HTMLElement {
    //     this.domButtonBar = DOM.create("div").addClass("DockerTS-PanelButtonBar");
    //     for(const iconButton of this.iconButtons) {
    //         this.domButtonBar.appendChild(iconButton.getDOM());
    //     }
    //     this.updateButtonsInDOM();
    //     return this.domButtonBar.get();
    // }

    // protected onUpdate(element: HTMLElement): void {
    //     this.domButtonBar.css("display", this.visible ? "flex" : "none");
    // }

    // private constructButtonFromConfig(config: IHeaderButton): IconButton {
    //     const iconButton = new IconButton(config.actionName, config.displayOrder);;
    //     iconButton.icon = config.icon;
    //     iconButton.title = config.title;
    //     iconButton.visible = config.visible;
    //     iconButton.on("onAction", this.handleActionTriggered);
    //     return iconButton;
    // }

    // private handleActionTriggered(actionName: string) {
    //     this.triggerEvent("onAction", actionName);
    // }

    // private updateButtonsInDOM() {
    //     // Remove all buttons from DOM
    //     this.iconButtons.forEach(btn => btn.getDOM().remove());
    //     // Sort the array by the display order
    //     this.iconButtons.sort((a, b) => a.getDisplayOrder() - b.getDisplayOrder());
    //     // Append sorted buttons again to DOM
    //     this.iconButtons.forEach(btn => this.domButtonBar.appendChild(btn.getDOM()));
    // }

    // private getIconButtonByAction(actionName: string): IconButton {
    //     for(const iconButton of this.iconButtons) {
    //         if(iconButton.getActionName() === actionName)
    //             return iconButton;
    //     }
    //     throw new Error(`ERROR: Icon Button for action ${actionName} not found.`);
    // }
}
