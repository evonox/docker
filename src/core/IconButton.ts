import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";

import "./IconButton.css";

export class IconButton extends Component {

    @property({defaultValue: ""})
    icon: string;

    @property({defaultValue: true})
    visible: boolean;

    @property({defaultValue: ""})
    title: string;

    private domButton: DOM<HTMLElement>;

    constructor(private actionName: string, private displayOrder: number) {
        super();
        this.initializeComponent();
    }

    getActionName() {
        return this.actionName;
    }

    getDisplayOrder() {
        return this.displayOrder;
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domButton = DOM.create("div").addClass("IconButton");

        this.bind(this.domButton.get(), "mousedown", this.handleButtonPressed.bind(this));
        this.bind(this.domButton.get(), "mouseup", this.handleButtonReleased.bind(this));
        this.bind(this.domButton.get(), "click", this.handleButtonClick.bind(this));
        this.bind(this.domButton.get(), "dblclick", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        });

        return this.domButton.get();
    }
    protected onUpdate(element: HTMLElement): void {
        this.domButton.html(this.icon).toggleClass("IconButton--Hidden", ! this.visible)
            .attr("title", this.title);
    }

    private handleButtonPressed(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.triggerEvent("onPressed", {actionName: this.actionName, event});
    }

    private handleButtonReleased(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.triggerEvent("onReleased", {actionName: this.actionName, event});
    }

    private handleButtonClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.triggerEvent("onClicked", {actionName: this.actionName, event});

        this.triggerEvent("onAction", this.actionName);
    }
}
