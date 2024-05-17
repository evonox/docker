import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";


export class CloseButton extends Component {

    private domButton: DOM<HTMLElement>;

    @property({defaultValue: true})
    visible: boolean;

    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.domButton = undefined;
    }

    protected onInitialRender(): HTMLElement {
        this.domButton = DOM.create("div").addClass("dockspan-tab-handle-close-button");
        this.bind(this.domButton.get(), "click", this.handleButtonClick);
        return this.domButton.get();
    }

    protected onUpdate(element: HTMLElement): void {
        if(this.visible) {
            this.domButton.css("display", "block");
        } else {
            this.domButton.css("display", "none");
        }
    }

    private handleButtonClick() {
        this.triggerEvent("click");
    }
}
