import { IHeaderButton } from "../common/panel-api";
import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";
import { IconButton } from "./IconButton";
import { isPanelDefaultAction } from "./panel-default-buttons";

import "./ButtonBar.css";

/**
 * Class managing a generic button bar - the list of row-aligned buttons
 */
export class ButtonBar extends Component {

    protected domButtonBar: DOM<HTMLElement>;
    protected iconButtons: IconButton[] = [];

    @property({defaultValue: true})
    visible: boolean;

    constructor() {
        super();
        this.handleActionTriggered = this.handleActionTriggered.bind(this)
        this.initializeComponent();
    }

    appendUserButton(button: IHeaderButton) {
        if(isPanelDefaultAction(button.actionName))
            throw new Error(`ERROR: Action name ${button.actionName} is a reserved name.`);
        const iconButton = this.constructButtonFromConfig(button);
        this.iconButtons.push(iconButton);
        this.updateButtonsInDOM();
    }

    removeUserButton(actionName: string) {
        if(isPanelDefaultAction(actionName))
            throw new Error("ERROR: Cannot remove default panel button.");

        const iconButton = this.getIconButtonByAction(actionName);
        iconButton.dispose();
        const index = this.iconButtons.indexOf(iconButton);
        if(index >= 0) {
            this.iconButtons.splice(index, 1);
        }
    }

    allowAction(actionName: string) {
        this.getIconButtonByAction(actionName).visible = true;
    }

    denyAction(actionName: string) {
        this.getIconButtonByAction(actionName).visible = false;
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {
        for(const iconButton of this.iconButtons) {
            iconButton.dispose();
        }
        this.iconButtons = [];
    }

    protected onInitialRender(): HTMLElement {
        this.domButtonBar = DOM.create("div").addClass("DockerTS-ButtonBar");
        for(const iconButton of this.iconButtons) {
            this.domButtonBar.appendChild(iconButton.getDOM());
        }
        this.updateButtonsInDOM();
        return this.domButtonBar.get();
    }

    protected onUpdate(element: HTMLElement): void {
        if(this.visible) {
            this.domButtonBar.show();
        } else {
            this.domButtonBar.hide();
        }
    }

    protected constructButtonFromConfig(config: IHeaderButton): IconButton {
        const iconButton = new IconButton(config.actionName, config.displayOrder);;
        iconButton.icon = config.icon;
        iconButton.title = config.title;
        iconButton.visible = config.visible;

        iconButton.on("onPressed", payload => this.triggerEvent("onPressed", payload));
        iconButton.on("onReleased", payload => this.triggerEvent("onReleased", payload));
        iconButton.on("onClicked", payload => this.triggerEvent("onClicked", payload));

        iconButton.on("onAction", this.handleActionTriggered);
        return iconButton;
    }

    protected handleActionTriggered(actionName: string) {
        this.triggerEvent("onAction", actionName);
    }

    private updateButtonsInDOM() {
        // Remove all buttons from DOM
        this.iconButtons.forEach(btn => btn.getDOM().remove());
        // Sort the array by the display order
        this.iconButtons.sort((a, b) => a.getDisplayOrder() - b.getDisplayOrder());
        // Append sorted buttons again to DOM
        this.iconButtons.forEach(btn => this.domButtonBar.appendChild(btn.getDOM()));
    }

    protected getIconButtonByAction(actionName: string): IconButton {
        for(const iconButton of this.iconButtons) {
            if(iconButton.getActionName() === actionName)
                return iconButton;
        }
        throw new Error(`ERROR: Icon Button for action ${actionName} not found.`);
    }
}
