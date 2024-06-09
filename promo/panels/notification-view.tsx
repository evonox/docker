import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager, IPanelAPI } from "../../src/docking-library";


export interface NotificationViewProps {
    dockManager: DockManager;
}

const NotificationView = (props: NotificationViewProps) => {

    return (<h1>Notification View</h1>)
}



export const NotificationFactoryFn = (dockManager: DockManager): IPanelAPI => {

    let root: Root;

    return {
        initialize: async (api) => {
            // Set the settings
            api.setPanelTitle("Notification View");
            api.setPanelFAIcon("fa-solid fa-bell");

            // Render React Component
            const domRoot = document.createElement("div");
            domRoot.style.height = "100%";
            root = createRoot(domRoot);
            root.render(<NotificationView dockManager={dockManager} />);
            return domRoot;
        },
        onClose: async () => {
            root.unmount();
            root = undefined;
        }
    }
}
