import { describe, expect, test } from "@jest/globals";
import { PanelState } from "./PanelState";


describe("PanelState Test Suite", () => {

    test("if returns a value", () => {
        const state = new PanelState({key: "value"});
        expect(state.getValue("key")).toBe("value");
    });

    test("if returns a null value", () => {
        const state = new PanelState({key: null});
        expect(state.getValue("key", "aa")).toBeNull();
    })

    test("if returns a default value", () => {
        const state = new PanelState({});
        expect(state.getValue("key", "aa")).toBe("aa");
    });

    test("if returns an undefined default value", () => {
        const state = new PanelState({});
        expect(state.getValue("key")).toBeUndefined();
    });

    test("if returns state object with set values", () => {
        const state = new PanelState({});
        state.setValue("key1", true);
        state.setValue("key2", "value");
        expect(state.getState()).toEqual({
            "key1": true,
            "key2": "value"
        });
    });
});