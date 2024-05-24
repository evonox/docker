import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { IMenuItem } from "../common/panel-api";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { MenuItem } from "./MenuItem";
import { MenuSeparator } from "./MenuSeparator";

import "./ContextMenu.css"

export class ContextMenu extends Component {

    private menuItems: MenuItem[] = [];
    private menuSeparators: MenuSeparator[] = [];

    private domContextMenu: DOM<HTMLElement>;

    constructor(private config: ContextMenuConfig) {
        super();
        this.handleInvokedAction = this.handleInvokedAction.bind(this);
        this.initializeComponent();
    }

    show(event: MouseEvent, zIndex: number ) {
        this.domContextMenu.addClass("DockerTS-ContextMenu--Visible")
            .left(event.pageX).top(event.pageY)
            .css("z-index", String(zIndex))
            .appendTo(document.body);
            
        this.bind(window, "mousedown", this.handleMouseDown.bind(this), {capture: true});
    }

    hide() {
        this.domContextMenu.removeClass("DockerTS-ContextMenu--Visible");
        this.dispose();
    }


    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.menuItems.forEach(mi => mi.dispose());
        this.menuSeparators.forEach(ms => ms.dispose());
        this.menuItems = [];
        this.menuSeparators = [];
    }

    protected onInitialRender(): HTMLElement {
        this.domContextMenu = DOM.create("div").addClasses(["DockerTS-ContextMenu"]);
        for(const item of this.config.queryMenuItemsOrdered()) {
            if(item.separator === true) {
                this.constructMenuSeparator();
            } else {
                this.constructMenuItem(item);
            }
        }
        return this.domContextMenu.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private constructMenuItem(item: IMenuItem) {
        const menuItem = new MenuItem(item.actionName);
        menuItem.icon = item.icon ?? "";
        menuItem.title = item.title;
        menuItem.disabled = item.disabled;
        menuItem.on("onAction", this.handleInvokedAction);

        this.menuItems.push(menuItem);
        this.domContextMenu.appendChild(menuItem.getDOM());
    }

    private constructMenuSeparator() {
        let separator = new MenuSeparator();
        this.menuSeparators.push(separator);
        this.domContextMenu.appendChild(separator.getDOM());
    }

    private handleInvokedAction(actionName: string) {
        this.triggerEvent("onAction", actionName);
        this.hide();
    }

    private handleMouseDown(event: MouseEvent) {
        if(this.isClickInsideMenu(event) === false) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            this.hide();
        }
    }

    private isClickInsideMenu(event: MouseEvent) {
        const menuBounds = this.domContextMenu.getBounds();
        return menuBounds.left < event.pageX && menuBounds.top < event.pageY &&
            event.pageX < menuBounds.right && event.pageY < menuBounds.bottom;
    }

}
