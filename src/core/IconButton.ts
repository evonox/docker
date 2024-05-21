import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";


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
        this.domButton = DOM.create("div").addClass("dockspawn-icon-button");
        this.bind(this.domButton.get(), "click", this.handleButtonClick.bind(this));
        return this.domButton.get();
    }
    protected onUpdate(element: HTMLElement): void {
        this.domButton.html(this.icon).toggleClass("downspawn-icon-button--hidden", ! this.visible)
            .attr("title", this.title);
    }

    private handleButtonClick(event: MouseEvent) {
        event.preventDefault();
        this.triggerEvent("onAction", this.actionName);
    }
}
