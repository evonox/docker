import { CLOSE_BUTTON_ICON } from "../core/panel-default-buttons";
import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";

import "./CloseButton.css"

export class CloseButton extends Component {

    private domButton: DOM<HTMLElement>;

    @property({defaultValue: true})
    visible: boolean;

    constructor() {
        super();
        this.initializeComponent();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.domButton = undefined;
    }

    protected onInitialRender(): HTMLElement {
        this.domButton = DOM.create("div").html(CLOSE_BUTTON_ICON).addClass("DockerTS-CloseButton");
        this.bind(this.domButton.get(), "mousedown", this.handleButtonClick);
        return this.domButton.get();
    }

    protected onUpdate(element: HTMLElement): void {
        if(this.visible) {
            this.domButton.show();
        } else {
            this.domButton.hide();
        }
    }

    private handleButtonClick(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        
        this.triggerEvent("click");
    }
}
