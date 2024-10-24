# HOW-TO - Notification Subsystem

The docking library contains notification pub/sub framework embedded inside it.
It might be useful when you need your panels to exchange notifications about important
events inside your application.

To subscribe to an event you may use the following code:
```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            api.channel().subscribe("ActivateMe", () => {
                api.activate()
            });
            return domElement;
        },
    }
});
```
In the figure above you use the **channel()** function to create a default channel and subscribe to
event "ActivateMe" which when triggered will activate this panel.

When you need to unsubscribe and clean up the handler, you can do it like this.
```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            const subscription = api.channel().subscribe("ActivateMe", () => {
                api.activate()
                subscription.unsubscribe();
            });
            return domElement;
        },
    }
});
```
After receiving the event, the panel will unsubscribe automatically.

The same functionality you may however achieve with the following code.
```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            api.channel().subscribeOnce("ActivateMe", () => {
                api.activate()
            });
            return domElement;
        },
    }
});
```
The code above will automatically unsubscribe when the message is received.

To notify a panel about an event, you can use the **notify** method.
```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            api.channel().notify("OnPanelCreated", "SamplePanel")
            return domElement;
        },
    }
});
```
The code above notifies all the subscribed handlers with the event "onPanelCreated" and as a payload
it sends the string "SamplePanel". As a payload you may send basically any JavaScript object.
The payload is received as the argument of your handler function.

To unsubscribe all handlers of the event, you may call method **unsubscribeAll()**.

> Note: This method is very destructive. It removes all the handlers, not only the once subscribed
> by the given panel. It is mostly useful in the advanced scenarios when using the named channels.

Finally, what to do when you have complex notification scenarios and one default channel is not 
enough for you?

Just pass to the **channel("...")** method the name of your channel to use. The channels are created 
lazily when they are firstly used.

```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            api.channel("SampleChannelName").notify("OnPanelCreated", "SamplePanel")
            return domElement;
        },
    }
});
```
The figure above sends the notification in the channel named "SampleChannelName".
