import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";


export class MenuSeparator extends Component {

    constructor() {
        super();
        this.initializeComponent();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        const domSeparator = DOM.create("div").addClass("DockerTS--Separator");
        return domSeparator.get();
    }

    protected onUpdate(element: HTMLElement): void {}
}
