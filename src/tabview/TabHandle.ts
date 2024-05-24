import { MOUSE_BTN_RIGHT } from "../common/constants";
import { Component } from "../framework/Component";
import { property, state } from "../framework/decorators";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { CloseButton } from "./CloseButton";

import "./TabHandle.css";

export class TabHandle extends Component {

    @property()
    title: string;

    @property({defaultValue: false})
    displayCloseButton: boolean;

    @state({defaultValue: false})
    isActive: boolean;


    @property({defaultValue: false})
    hasPanelChanges: boolean;

    private domRoot: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;

    private closeButton: CloseButton;

    constructor() {
        super();
        this.initializeComponent();
    }

    setSelected(isSelected: boolean) {
        this.domRoot.toggleClass("dockspan-tab-handle-selected", isSelected);
        if(isSelected) {
            this.domRoot.addClass("dockspan-tab-handle-active");
        }
        if(isSelected === false) {
            this.isActive = false;
        }
    }

    setActive(isActive: boolean) {        
        this.isActive = isActive;
    }

    protected onInitialized(): void {
        this.closeButton = new CloseButton();
        this.closeButton.visible = this.displayCloseButton;
        this.closeButton.on("click", this.handleCloseButtonClick);

        // TODO: ASSIGN UNDOCK HANDLER - HOW????

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

        this.bind(this.domRoot.get(), "mousedown", this.handleMouseDown);
        this.bind(this.domRoot.get(), "contextmenu", this.handleShowContextMenu.bind(this));


        // HIDE CLOSE BUTTON IF GRAYED OR DISALLOWED BY PANEL CONTAINER
        // APPEND ROOT TO TABLIST ELEMENT
        // UPDATE TITLE FROM THE PANEL
        // BIND UNDOCK LISTENER
        // CONTEXT MENU HANDLING

        return this.domRoot.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.closeButton.visible = this.displayCloseButton;
        this.domTitle.html(this.title).attr("title", this.domTitle.getText());

        this.domRoot.toggleClass("DockerTS-TabHandle--Active", this.isActive);
        this.domTitle.toggleClass("DockerTS-TabHandle--HasChanges", this.hasPanelChanges);
    }

    private handleCloseButtonClick() {
        // TODO: REQUEST PANEL CLOSE
    }

    private previousX: number;
    private currentX: number;

    private handleMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.currentX = event.pageX;        
        this.triggerEvent("onSelected");
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

    private handleShowContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.triggerEvent("onContextMenu", event);
    }
 }
