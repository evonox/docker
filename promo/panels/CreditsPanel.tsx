import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager } from "../../src/facade/DockManager";
import { IPanelAPI } from "../../src/common/panel-api";


function CreditsContent() {

    return (
        <h1>CREDITS</h1>
    );
}

export const CreditsFactoryFn = (dockManager: DockManager): IPanelAPI => {

    let root: Root;

    return {
        initialize: async (api) => {
            // Set the settings
            api.setPanelTitle("Credits View");
            api.setPanelFAIcon("fa fa-star");

            // Render React Component
            const domRoot = document.createElement("div");
            domRoot.style.height = "100%";
            root = createRoot(domRoot);
            root.render(<CreditsContent />);
            return domRoot;
        },
        onClose: async () => {
            root.unmount();
            root = undefined;
        }
    }

}