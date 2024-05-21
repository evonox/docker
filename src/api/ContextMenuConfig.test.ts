import { describe, expect, test } from "@jest/globals";
import { ContextMenuConfig } from "./ContextMenuConfig";
import { IMenuItem } from "../common/panel-api";


describe("ContextMenuConfig TestSuite", () => {

    test("if menu separator can be added", () => {
        const config = new ContextMenuConfig();
        config.appendMenuItem({displayOrder: 1, separator: true});
        expect(config.getMenuItems().length).toBe(1);
    });

    test("if menu item can be added", () => {
        const config = new ContextMenuConfig();
        config.appendMenuItem({displayOrder: 1, actionName: "ActionName", title: "Test Label", disabled: false})
        config.appendMenuItem({displayOrder: 2, separator: true});
        expect(config.getMenuItems().length).toBe(2);
    });

    test("if throws exception for incomplete menu item definition", () => {
        const config = new ContextMenuConfig();
        expect(() => {
            config.appendMenuItem({displayOrder: 1, actionName: "ActionName"})
        }).toThrowError()
        expect(() => {
            config.appendMenuItem({displayOrder: 2, title: "Title"})
        }).toThrowError()
    });

    test("if returns all menu items in display order", () => {
        const config = new ContextMenuConfig();
        config.appendMenuItem({displayOrder: 3, actionName: "ActionName2", title: "Test Label", disabled: false})
        config.appendMenuItem({displayOrder: 2, separator: true});
        config.appendMenuItem({displayOrder: 1, actionName: "ActionName", title: "Test Label", disabled: false})

        const menuItems = config.queryMenuItemsOrdered();
        expect(menuItems[0].displayOrder).toBe(1);
        expect(menuItems[1].displayOrder).toBe(2);
        expect(menuItems[2].displayOrder).toBe(3);
    });

    test("if removes a menu item from the list", () => {
        const config = new ContextMenuConfig();
        const separator: IMenuItem = {displayOrder: 2, separator: true};

        config.appendMenuItem({displayOrder: 3, actionName: "ActionName2", title: "Test Label", disabled: false})
        config.appendMenuItem(separator);
        config.appendMenuItem({displayOrder: 1, actionName: "ActionName", title: "Test Label", disabled: false})

        config.removeMenuItem(separator);

        const menuItems = config.queryMenuItemsOrdered();
        expect(menuItems.length).toBe(2);
        expect(menuItems[0].displayOrder).toBe(1);
        expect(menuItems[1].displayOrder).toBe(3);
    });

    test("if invokes exception for duplicate action name", () => {
        const config = new ContextMenuConfig();
        config.appendMenuItem({displayOrder: 1, actionName: "ActionName", title: "Label 1"})

        expect(() => {
            config.appendMenuItem({displayOrder: 2, actionName: "ActionName", title: "Label 2"})
        }).toThrowError()
    });
});
