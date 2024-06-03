# HOW-TO: Custom Panel Header Buttons

It is possible to add your custom buttons to the panel header. It can be easily done using the
panel state API as follows.

```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            api.addHeaderButton({
                displayOrder: 100,
                icon: `<i class="fa fa-plus"></i>`,
                title: "Add document",
                actionName: "AddDocument",
                visible: true
            });           
            return domElement;
        },
    }
});
```
In the initializaton function you invoke the **addHeaderButton** API method to add your button.
Basically you add the display order of the button, its icon which can be either SVG or FontAwesome icon,
then the title and you must not forget the action name. 

By this action name you will be notified by the second handler when the button is clicked. How to handle 
events the your header button is triggered is depicted in the following example.

```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");
            api.addHeaderButton({
                displayOrder: 100,
                icon: `<i class="fa fa-plus"></i>`,
                title: "Add document",
                actionName: "AddDocument",
                visible: true
            });           
            return domElement;
        },

        // This handler is invoked when the context menu item or custom header button is triggered
        onActionInvoked: (actionName) => {
            if(actionName === "YOUR_ACTION_NAME") {
                /**
                 *  HANDLE THE ACTION
                 */
            }
        }
    }
});
```
The **onActionInvoked** is triggered all the time when the context menu item or custom header button
is activated. As a argument it has the name of action you pass in the metadata for your context menu
item or the header button.

You can also show / hide the header button or completely remove it by using the following methods.

```typescript
dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("div");

            // Appends the new header button
            api.addHeaderButton({
                displayOrder: 100,
                icon: `<i class="fa fa-plus"></i>`,
                title: "Add document",
                actionName: "AddDocument",
                visible: true
            });

            // Hides the header button - the button is identified by the action name
            api.showHeaderButton("AddDocument", false);

            // Removes the header button completely - the button is identified by the action name
            api.removeHeaderButton("AddDocument");

            return domElement;
        },
    }
});
```
At the end I summarize the default display orders of the system buttons. It might be sometimes
important if you have the intention to place your custom button in the middle of them.

| System Header Button Name | Default Display Order |
|---------------------------|-----------------------|
| Collapse Button           | 5000                  |
| Expand Button             | 6000                  |
| Minimize Button           | 7000                  |
| Restore Button            | 8000                  |
| Maximize Button           | 9000                  |
| Close Button              | 10000                 |

