/**
 * @jest-environment jsdom
 */
import { describe, expect, jest, test } from "@jest/globals";
import { DOMEvent } from "./dom-events";


describe("DOM Event Test Suite", () => {

    test("if binded event gets triggered", () => {
        const element = document.createElement("div");
        const domEvent = new DOMEvent<Event>(element);
        const fnMock = jest.fn(() => {});
        domEvent.bind("click", fnMock, {capture: false});
        element.click();
        expect(fnMock).toBeCalledTimes(1);
    });

    test("if unbinded event does NOT get triggered", () => {
        const element = document.createElement("div");
        const domEvent = new DOMEvent<Event>(element);
        const fnMock = jest.fn(() => {});
        domEvent.bind("click", fnMock, {capture: false});

        element.click();
        element.click();
        domEvent.unbind();
        element.click();

        expect(fnMock).toBeCalledTimes(2);
    });
});
