import { describe, expect, test } from "@jest/globals";
import { PanelInitConfig } from "./PanelInitConfig";


describe("PanelInitConfig Test Suite", () => {

    test("if returns a value", () => {
        const config = new PanelInitConfig({"key": "value"});
        expect(config.getValue("key")).toBe("value");
    });

    test("if returns a null value", () => {
        const config = new PanelInitConfig({"key": null});
        expect(config.getValue("key")).toBeNull();
    });

    test("if returns a default value", () => {
        const config = new PanelInitConfig({"key": null});
        expect(config.getValue("otherKey", "default")).toBe("default");
    });
});