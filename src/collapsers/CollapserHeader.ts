import { DockKind } from "../common/enumerations";
import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";
import { EventHelper } from "../utils/event-helper";

import "./CollapserHeader.css";

/**
 * 
 * Collapser Header placed inside the Collapser Margin
 * 
 *  Events:
 *      - onMouseEnter - mouse entered the component
 *      - onMouseLeave - mouse left the component
 */
export class CollapserHeader extends Component {

    // Component DOM Content
    private domRoot: DOM<HTMLElement>;
    private domIcon: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;

    // Properties
    @property({defaultValue: ""})
    icon: string;

    @property({defaultValue: ""})
    title: string;

    constructor(private collapseKind: DockKind, private thickness: number) {
        super();
        this.initializeComponent();
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domRoot = DOM.create("div")
            .applyClasses({
                "DockerTS-CollapserHeader": true,
                "DockerTS-CollapserHeader--Left": this.collapseKind === DockKind.Left,
                "DockerTS-CollapserHeader--Right": this.collapseKind === DockKind.Right,
                "DockerTS-CollapserHeader--Down": this.collapseKind === DockKind.Down
            }).css("--docker-ts-header-thickness", `${this.thickness}px`);

        this.domIcon = DOM.create("div").addClass("DockerTS-CollapserHeader__Icon").appendTo(this.domRoot);
        this.domTitle = DOM.create("div").addClass("DockerTS-CollapserHeader__Title").appendTo(this.domRoot);

        this.bind(this.domRoot.get(), "mouseenter", this.handleOnMouseEnter.bind(this));
        this.bind(this.domRoot.get(), "mouseleave", this.handleOnMouseLeave.bind(this));
        
        return this.domRoot.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domIcon.html(this.icon);
        this.domTitle.text(this.title);
    }

    private handleOnMouseEnter(event: MouseEvent) {
        EventHelper.suppressEvent(event);
        this.triggerEvent("onMouseEnter");
    }

    private handleOnMouseLeave(event: MouseEvent) {
        EventHelper.suppressEvent(event);
        this.triggerEvent("onMouseLeave");
    }
}
