import { MOUSE_BTN_RIGHT } from "../common/constants";
import { SelectionState, TabOrientation } from "../common/enumerations";
import { Component } from "../framework/Component";
import { property, state } from "../framework/decorators";
import { DOM } from "../utils/DOM";
import { DetectionMode, DragAndDrop } from "../utils/DragAndDrop";
import { CloseButton } from "./CloseButton";

import "./TabHandle.css";

/**
 * TabHandle Component
 * Events:
 *      onTabClicked    - tab handle was clicked
 *      onTabDblClicked - tab handle was double clicked - (triggers panel maximization)
 *      onTabMoved      - tab reorder was requested by drag-and-drop
 *      onCloseClicked  - close button was clicked
 *      onContextMenu   - user requests to show context menu
 * 
 * TO-DOs:
 *      - bind drag-and-drop to initiate the panel undock operation
 */

export class TabHandle extends Component {

    @property({defaultValue: TabOrientation.Bottom})
    orientation: TabOrientation;

    @property({defaultValue:  ""})
    icon: string;

    @property({defaultValue: ""})
    title: string;

    @property({defaultValue: false})
    closeButtonVisible: boolean;

    @property({defaultValue: false})
    isModifiedState: boolean;

    @state({defaultValue: SelectionState.Unselected})
    selectionState: SelectionState;

    private domRoot: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;

    private closeButton: CloseButton;

    constructor(private isUndockEnabled: boolean) {
        super();
        this.initializeComponent();
    }

    setSelectionState(state: SelectionState) {
        this.selectionState = state;
    }

    getUndockEnabled(): boolean {
        return this.isUndockEnabled;
    }

    setUndockEnabled(flag: boolean) {
        this.isUndockEnabled = flag;
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {
        this.closeButton = new CloseButton();
        this.closeButton.visible = this.closeButtonVisible;
        this.closeButton.on("onClick", this.handleCloseButtonClick.bind(this));
    }

    protected onDisposed(): void {
        this.closeButton.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domRoot = DOM.create("div").addClasses(["DockerTS-TabHandle", "DockerTS--DisableSelection"]);
        this.domTitle = DOM.create("div")
            .addClass("DockerTS-TabHandle__TitleText")
            .appendTo(this.domRoot);
        this.domRoot.appendChild(this.closeButton.getDOM());

        this.bind(this.domRoot.get(), "mousedown", this.handleMouseDown.bind(this));
        this.bind(this.domRoot.get(), "dblclick", this.handleMouseDblClick.bind(this));
        this.bind(this.domRoot.get(), "contextmenu", this.handleShowContextMenu.bind(this));

        return this.domRoot.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.applyTabOrientationCSS();
        this.applySelectionCSS();

        this.closeButton.visible = this.closeButtonVisible;
        const domIcon = DOM.create("div").html(this.icon);
        this.domTitle.html("").text(this.title).prependChild(domIcon).attr("title", this.title);

        this.domTitle.toggleClass("DockerTS-TabHandle--HasChanges", this.isModifiedState);
    }

    private applyTabOrientationCSS() {
        this.domRoot.applyClasses({
            "DockerTS-TabHandle--Left": this.orientation === TabOrientation.Left,
            "DockerTS-TabHandle--Right": this.orientation === TabOrientation.Right,
            "DockerTS-TabHandle--Top": this.orientation === TabOrientation.Top,
            "DockerTS-TabHandle--Bottom": this.orientation === TabOrientation.Bottom
        })       
    }

    private applySelectionCSS() {
        this.domRoot.applyClasses({
            "DockerTS-TabHandle--Unselected": this.selectionState === SelectionState.Unselected,
            "DockerTS-TabHandle--Selected": this.selectionState === SelectionState.Selected,
            "DockerTS-TabHandle--Focused": this.selectionState === SelectionState.Focused
        })
    }

    /**
     * Event Handlers
     */

    private handleCloseButtonClick() {
        this.triggerEvent("onCloseClicked");
    }

    private handleShowContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.triggerEvent("onContextMenu", event);
    }

    private handleMouseDblClick(event: MouseEvent) {
        this.triggerEvent("onTabDblClicked");
    }

    private handleMouseDown(event: MouseEvent) {
        this.triggerEvent("onMouseDown", {event, tabHandle: this});
        this.triggerEvent("onTabClicked");
        if(event.button === MOUSE_BTN_RIGHT)
            return;
    }
 }
