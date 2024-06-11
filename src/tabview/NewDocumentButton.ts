import { DOM } from "../utils/DOM";
import { Component } from "../framework/Component";
import { NEW_DOCUMENT_ICON } from "../core/panel-default-buttons";
import { EventHelper } from "../utils/event-helper";
import { property } from "../framework/decorators";

import "./NewDocumentButton.css";

export class NewDocumentButton extends Component {

    private domButton: DOM<HTMLElement>;

    @property({defaultValue: ""})
    title: string;

    @property({defaultValue: false})
    visible: boolean;

    constructor() {
        super();
        this.initializeComponent();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domButton = DOM.create("div")
            .addClass("NewDocumentButton")
            .html(NEW_DOCUMENT_ICON);

        this.bind(this.domButton.get(), "click", this.handleButtonClick.bind(this));

        return this.domButton.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domButton.attr("title", this.title);
        this.domButton.toggleClass("NewDocumentButton--Visible", this.visible);
    }

    private handleButtonClick(event: MouseEvent) {
        EventHelper.suppressEvent(event);
        this.triggerEvent("onClicked");
    }
}
