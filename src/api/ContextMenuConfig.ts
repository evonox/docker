import { IContextMenuAPI, IMenuItem } from "../common/panel-api";


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

    // TODO: VALIDATION
    appendMenuItem(item: IMenuItem): void {
        this.menuItems.push(item);
    }

    removeMenuItem(item: IMenuItem): void {
        const index = this.menuItems.indexOf(item);
        if(index >= 0) {
            this.menuItems.splice(index);
        }
    }
}
