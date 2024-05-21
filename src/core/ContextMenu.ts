import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { IMenuItem } from "../common/panel-api";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { MenuItem } from "./MenuItem";
import { MenuSeparator } from "./MenuSeparator";


export class ContextMenu extends Component {

    private menuItems: MenuItem[] = [];
    private menuSeparators: MenuSeparator[] = [];

    private domContextMenu: DOM<HTMLElement>;

    constructor(private config: ContextMenuConfig) {
        super();
        this.handleInvokedAction = this.handleInvokedAction.bind(this);
    }

    // TODO: POSITION CONTEXT MENU AND SHOW
    show(event: MouseEvent ) {

    }

    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.menuItems.forEach(mi => mi.dispose());
        this.menuSeparators.forEach(ms => ms.dispose());
        this.menuItems = [];
        this.menuSeparators = [];
    }

    protected onInitialRender(): HTMLElement {
        this.domContextMenu = DOM.create("div").addClasses(["dockspawn-context-menu", "context-menu-hidden"]);
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
    }
}
