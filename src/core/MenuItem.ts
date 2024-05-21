import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";


/**
 * TODO: EMBED ICON 
 */
export class MenuItem extends Component {

    private domMenuItem: DOM<HTMLElement>;

    @property(({defaultValue: ""}))
    icon: string;

    @property({defaultValue: ""})
    title: string;

    @property({defaultValue: false})
    disabled: boolean;

    constructor(private actionName: string) {
        super();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domMenuItem = DOM.create("div").addClass("menu-item");
        this.bind(this.domMenuItem.get(), "click", this.handleMouseClick.bind(this));
        return this.domMenuItem.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domMenuItem.text(this.title).toggleClass("menu-item-disabled", this.disabled);
    }

    private handleMouseClick(event: MouseEvent) {
        this.triggerEvent("onAction", this.actionName);
    }
}
