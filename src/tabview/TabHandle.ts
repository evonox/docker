import { MOUSE_BTN_RIGHT } from "../common/constants";
import { SelectionState, TabOrientation } from "../common/enumerations";
import { Component } from "../framework/Component";
import { property, state } from "../framework/decorators";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { CloseButton } from "./CloseButton";

import "./TabHandle.css";

/**
 * TabHandle Component
 * Events:
 *      onTabClicked    - tab handle was clicked
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

    @property({defaultValue: ""})
    titleTemplate: string;

    @property({defaultValue: false})
    closeButtonVisible: boolean;

    @property({defaultValue: false})
    isModifiedState: boolean;

    @state({defaultValue: SelectionState.Unselected})
    selectionState: SelectionState;

    private domRoot: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;

    private closeButton: CloseButton;

    constructor() {
        super();
        this.initializeComponent();
    }

    setSelectionState(state: SelectionState) {
        this.selectionState = state;
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {
        this.closeButton = new CloseButton();
        this.closeButton.visible = this.closeButtonVisible;
        this.closeButton.on("click", this.handleCloseButtonClick.bind(this));
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
        this.bind(this.domRoot.get(), "contextmenu", this.handleShowContextMenu.bind(this));

        return this.domRoot.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.applyTabOrientationCSS();
        this.applySelectionCSS();

        this.closeButton.visible = this.closeButtonVisible;
        this.domTitle.html(this.titleTemplate).attr("title", this.domTitle.getText());

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

    /**
     * TODO: REWORK AFTER THE REST IS TESTED
     * TODO: MOVING ANIMATION????
     */

    private previousX: number;
    private currentX: number;

    private handleMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.currentX = event.pageX;        
        this.triggerEvent("onTabClicked");
        if(event.button === MOUSE_BTN_RIGHT)
            return;

        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this), "pointer");
    }

    private handleMouseMove(event: MouseEvent) {
        this.domRoot.addClass("dockspan-tab-handle-dragged");

        this.previousX = this.currentX;
        this.currentX = event.pageX;
        const direction = this.currentX - this.previousX;
        const domRect = this.domRoot.getBounds();
        const moveDirection = direction < 0 ? "left" : "right";

        if((event.pageX < domRect.left && direction < 0) || (event.pageX > domRect.right && direction > 0)) {
            this.triggerEvent("onTabMoved", moveDirection);
        }
    }

    private handleMouseUp(event: MouseEvent) {
        this.domRoot.removeClass("dockspan-tab-handle-dragged");        
    }
 }
