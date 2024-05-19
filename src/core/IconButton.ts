import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";


export class IconButton extends Component {

    @property({defaultValue: ""})
    icon: string;

    @property({defaultValue: true})
    visible: boolean;

    private domRoot: DOM<HTMLElement>;

    constructor(private actionName: string) {
        super();
    }

    getActionName() {
        return this.actionName;
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domRoot = DOM.create("div").addClass("dockspawn-icon-button");
        this.bind(this.domRoot.get(), "click", this.handleButtonClick.bind(this));
        return this.domRoot.get();
    }
    protected onUpdate(element: HTMLElement): void {
        this.domRoot.html(this.icon).toggleClass("downspawn-icon-button--hidden", ! this.visible);
    }

    private handleButtonClick(event: MouseEvent) {
        this.triggerEvent("onAction", this.actionName);
    }
}
