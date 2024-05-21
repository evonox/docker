import { IContextMenuAPI, IMenuItem } from "../common/panel-api";

/**
 * Class managing the configuration of context menu items.
 * As for now, nesting of menu items is not supported.
 */
export class ContextMenuConfig implements IContextMenuAPI {

    private menuItems: IMenuItem[] = [];

    queryMenuItemsOrdered() {
        const menuItems = [...this.menuItems];
        menuItems.sort((a, b) => a.displayOrder - b.displayOrder);
        return menuItems;
    }

    getMenuItems(): IMenuItem[] {
        return [...this.menuItems];
    }

    appendMenuItem(item: IMenuItem): void {
        if(item.separator === true) {
            this.menuItems.push(item);
        } else {
            if(typeof item.actionName !== "string" || typeof item.title !== "string")
                throw new Error("ERROR: Menu item must have at least 'title' and 'actionName' fields defined");
            if(this.existsActionName(item.actionName))
                throw new Error(`ERROR: Action name ${item.actionName} is already registered.`);   

            this.menuItems.push(item);
        }
    }

    removeMenuItem(item: IMenuItem): void {
        const index = this.menuItems.indexOf(item);
        if(index >= 0) {
            this.menuItems.splice(index, 1);
        }
    }

    private existsActionName(actionName: string): boolean {
        const menuItems = this.menuItems.filter(mi => mi.separator !== true);
        return menuItems.find(mi => mi.actionName === actionName) !== undefined;
    }
}
