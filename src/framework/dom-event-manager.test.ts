/**
 * @jest-environment jsdom
 */
import { describe, expect, jest, test } from "@jest/globals";
import { DOMEventManager } from "./dom-event-manager";


describe("DOM Event Manager Test Suite", () => {

    test("subscribed fn gets called", () => {
        const manager = new DOMEventManager();
        const element1 = document.createElement("div");
        const element2 = document.createElement("div");
        const mockFn1 = jest.fn(() => {});
        const mockFn2 = jest.fn(() => {});
        
        manager.bind(element1, "click", mockFn1, {capture: false});
        manager.bind(element2, "click", mockFn2, {capture: false});

        element1.click();
        element2.click();
        element2.click();

        expect(mockFn1).toBeCalledTimes(1);
        expect(mockFn2).toBeCalledTimes(2);
    });

    test("test unsubcribed fn does NOT get called", () => {
        const manager = new DOMEventManager();
        const element1 = document.createElement("div");
        const element2 = document.createElement("div");
        const mockFn1 = jest.fn(() => {});
        const mockFn2 = jest.fn(() => {});
        
        manager.bind(element1, "click", mockFn1, {capture: false});
        const subs = manager.bind(element2, "click", mockFn2, {capture: false});

        element1.click();
        element2.click();
        subs.unbind();
        element2.click();

        expect(mockFn1).toBeCalledTimes(1);
        expect(mockFn2).toBeCalledTimes(1);
    });

    test("in case of unbind all nothing gets called", () => {
        const manager = new DOMEventManager();
        const element1 = document.createElement("div");
        const element2 = document.createElement("div");
        const mockFn1 = jest.fn(() => {});
        const mockFn2 = jest.fn(() => {});
        
        manager.bind(element1, "click", mockFn1, {capture: false});
        manager.bind(element2, "click", mockFn2, {capture: false});

        element1.click();
        element2.click();
        element2.click();

        manager.unbindAll();

        element1.click();
        element2.click();

        expect(mockFn1).toBeCalledTimes(1);
        expect(mockFn2).toBeCalledTimes(2);

    });

});