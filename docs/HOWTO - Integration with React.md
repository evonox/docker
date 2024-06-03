# HOW-TO - Integration with React

The integration of the docking library with React is very simple.
It is important to know that each panel must have its own mounted React root element.

Basically you can mount to the panel any single React component like this.

```tsx
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager } from "../../src/facade/DockManager";

function RootComponent() {
    return (
        <h1>Root Component</h1>
    );
}

dockManager.registerPanelType("samplePanel", "singleton", (dockManager) => {

    let root: Root;

    return {
        initialize: async (api, options) => {
            // Create the root mounting element
            const domRoot = document.createElement("div");
            // Set it the full height
            domRoot.style.height = "100%";
            // Create the React Root
            root = createRoot(domRoot);
            // Finally, render your component and return the root DOM element
            root.render(<RootComponent />);
            return domRoot;
        },
        onClose: async () => {
            // It is important to unmount the React component when closing the panel
            root.unmount();
            root = undefined;
        }

    }
});
```
The example above creates an empty HTML element. Then it creates the React root and renders
the RootComponent inside it. Finally it returns the container HTML Element.

When the panel is about to close, the docking library invokes **onClose** method where you
should unmount your React component.
