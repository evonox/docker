import { describe, expect, jest, test } from "@jest/globals";
import { ComponentEvent, ComponentEventManager, EventHandlerSubscription } from "./component-events";


describe("Component Events Test Suite", () => {

    test("Subscription Handler is triggered without payload", () => {
        const fnHandler = jest.fn(() => {});
        const fnEventList = jest.fn().mockImplementation(() => ComponentEvent);
        const subscription = new EventHandlerSubscription(fnHandler, new fnEventList("eventName") as ComponentEvent);
        subscription.trigger();
        expect(fnHandler).toBeCalledTimes(1);
    });

    test("Subscription Handler is triggered with payload", () => {
        const fnHandler = jest.fn(() => {});
        const fnEventList = jest.fn().mockImplementation(() => {
            return {
                removeSubscription: () => {}
            }
        });
        const subscription = new EventHandlerSubscription(fnHandler, new fnEventList() as ComponentEvent);

        subscription.trigger(1234);

        expect(fnHandler).toBeCalledTimes(1);
        expect(fnHandler).lastCalledWith(1234);
    });

    test("Subscription Handler is not triggered after unsubscribe", () => {
        const fnHandler = jest.fn(() => {});
        const fnEventList = jest.fn().mockImplementation(() => {
            return {
                removeSubscription: () => {}
            }
        });
        const subscription = new EventHandlerSubscription(fnHandler, new fnEventList() as ComponentEvent);

        subscription.trigger();
        subscription.trigger();
        subscription.unsubscribe();
        subscription.trigger();

        expect(fnHandler).toBeCalledTimes(2);
    })

    test("ComponentEvent returns its name", () => {
        const event = new ComponentEvent("EventOne");
        expect(event.getEventName()).toEqual("EventOne");
    });

    test("ComponentEvent triggers all handlers", () => {
        const event = new ComponentEvent("EventOne");
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        event.subscribe(fnMock1);
        event.subscribe(fnMock2);
        event.subscribe(fnMock3);
        event.trigger(null);
        event.trigger(false);

        expect(fnMock1).toBeCalledTimes(2);
        expect(fnMock2).toBeCalledTimes(2);
        expect(fnMock3).toBeCalledTimes(2);
        expect(fnMock1).lastCalledWith(false);
        expect(fnMock2).lastCalledWith(false);
        expect(fnMock3).lastCalledWith(false);
    });

    test("ComponentEvent does not trigger unsubscribe handlers", () => {
        const event = new ComponentEvent("EventOne");
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        event.subscribe(fnMock1);
        const subs = event.subscribe(fnMock2);
        event.subscribe(fnMock3);
        event.trigger(null);
        subs.unsubscribe();
        event.trigger(false);

        expect(fnMock1).toBeCalledTimes(2);
        expect(fnMock2).toBeCalledTimes(1);
        expect(fnMock3).toBeCalledTimes(2);
        expect(fnMock1).lastCalledWith(false);
        expect(fnMock2).lastCalledWith(null);
        expect(fnMock3).lastCalledWith(false);
    });


    test("ComponentEvent does NOT trigger anything by dispose() operation", () => {
        const event = new ComponentEvent("EventOne");
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        event.subscribe(fnMock1);
        event.subscribe(fnMock2);
        event.subscribe(fnMock3);

        event.trigger(null);
        event.trigger(1);
        event.disposeAll();
        event.trigger(false);
        event.trigger(true);

        expect(fnMock1).toBeCalledTimes(2);
        expect(fnMock2).toBeCalledTimes(2);
        expect(fnMock3).toBeCalledTimes(2);
        expect(fnMock1).lastCalledWith(1);
        expect(fnMock2).lastCalledWith(1);
        expect(fnMock3).lastCalledWith(1);
    });

    test("if component event manager triggers event", () => {
        const manager = new ComponentEventManager();
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        manager.subscribe("EventOne", fnMock1);
        manager.subscribe("EventOne", fnMock2);
        manager.subscribe("EventTwo", fnMock3);

        manager.triggerEvent("EventOne");
        manager.triggerEvent("EventTwo");
        manager.triggerEvent("EventTwo");

        expect(fnMock1).toBeCalledTimes(1);
        expect(fnMock2).toBeCalledTimes(1);
        expect(fnMock3).toBeCalledTimes(2);
    });

    test("if component event manager triggers subcribed-once event maximum once", () => {
        const manager = new ComponentEventManager();
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        manager.subscribe("EventOne", fnMock1);
        manager.subscribeOnce("EventOne", fnMock2);
        manager.subscribe("EventTwo", fnMock3);

        manager.triggerEvent("EventOne");
        manager.triggerEvent("EventOne");
        manager.triggerEvent("EventTwo");
        manager.triggerEvent("EventTwo");

        expect(fnMock1).toBeCalledTimes(2);
        expect(fnMock2).toBeCalledTimes(1);
        expect(fnMock3).toBeCalledTimes(2);
    });

    test("if component event manager does not trigger unsubscribed event", () => {
        const manager = new ComponentEventManager();
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        manager.subscribe("EventOne", fnMock1);
        manager.subscribe("EventOne", fnMock2);
        manager.subscribe("EventTwo", fnMock3);

        manager.triggerEvent("EventOne");
        manager.unsubscribeAll("EventOne");
        manager.triggerEvent("EventOne");
        manager.triggerEvent("EventTwo");
        manager.triggerEvent("EventTwo");

        expect(fnMock1).toBeCalledTimes(1);
        expect(fnMock2).toBeCalledTimes(1);
        expect(fnMock3).toBeCalledTimes(2);

    });

    test("if component event manager does not trigger anything after dispose() operation", () => {
        const manager = new ComponentEventManager();
        const fnMock1 = jest.fn(() => {});
        const fnMock2 = jest.fn(() => {});
        const fnMock3 = jest.fn(() => {});
        manager.subscribe("EventOne", fnMock1);
        manager.subscribe("EventOne", fnMock2);
        manager.subscribe("EventTwo", fnMock3);

        manager.triggerEvent("EventOne");
        manager.disposeAll();
        manager.triggerEvent("EventOne");
        manager.triggerEvent("EventTwo");
        manager.triggerEvent("EventTwo");

        expect(fnMock1).toBeCalledTimes(1);
        expect(fnMock2).toBeCalledTimes(1);
        expect(fnMock3).toBeCalledTimes(0);
    });
});
