import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";


/**
 * TODO: EMBED ICON 
 */
export class MenuItem extends Component {

    private domMenuItem: DOM<HTMLElement>;
    private domIcon: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;

    @property(({defaultValue: ""}))
    icon: string;

    @property({defaultValue: ""})
    title: string;

    @property({defaultValue: false})
    disabled: boolean;

    constructor(private actionName: string) {
        super();
        this.initializeComponent();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domMenuItem = DOM.create("div").addClass("DockerTS-MenuItem");
        this.domIcon = DOM.create("div").appendTo(this.domMenuItem).addClass("DockerTS-MenuItem__Icon");
        this.domTitle = DOM.create("div").appendTo(this.domMenuItem);

        this.bind(this.domMenuItem.get(), "click", this.handleMouseClick.bind(this));
        return this.domMenuItem.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domIcon.html(this.icon);
        this.domTitle.text(this.title);
        this.domMenuItem.toggleClass("DockerTS-MenuItem--Disabled", this.disabled);
    }

    private handleMouseClick(event: MouseEvent) {
        this.triggerEvent("onAction", this.actionName);
    }
}
