import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager, IPanelAPI, PanelContainer } from "../../src/docking-library";
import { DockNode } from "../../src/model/DockNode";

import "./notification-view.css";

/**
 * Class listening to notifications & formatting them
 */
class NotificationListener {

    constructor(
        private dockManager: DockManager, 
        private addMessage: (message: string) => void
    ) {

        this.dockManager.listenTo("onDock", payload => {
            this.processDockNodeMessage("OnDock Event - Panel: ", payload.node);
        });
        this.dockManager.listenTo("onUndock", payload => {
            this.processDockNodeMessage("OnUndock Event - Panel: ", payload.node);
        });
        this.dockManager.listenTo("onCollapsed", payload => {
            this.processPanelMessage("onCollapsed Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onExpanded", payload => {
            this.processPanelMessage("onExpanded Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onMaximized", payload => {
            this.processPanelMessage("onMaximized Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onMinimized", payload => {
            this.processPanelMessage("onMinimized Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onRestored", payload => {
            this.processPanelMessage("onRestored Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onUndockToPopup", payload => {
            this.processPanelMessage("onUndockToPopup Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onDockFromPopup", payload => {
            this.processPanelMessage("onDockFromPopup Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onUnpinned", payload => {
            this.processPanelMessage("onUnpinned Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onPinned", payload => {
            this.processPanelMessage("onPinned Event - Panel: ", payload.container as PanelContainer);
        })
        this.dockManager.listenTo("onActivePanelChange", payload => {
            this.processPanelMessage("onDeactivated Event - Panel: ", payload.previousActivePanel);
            this.processPanelMessage("onActivated Event - Panel: ", payload.activePanel);
        })
                
    }

    private processDockNodeMessage(message: string, dockNode: DockNode) {
        this.addMessage(message + (dockNode.container as PanelContainer).getTitle());
    }

    private processPanelMessage(message: string, panel: PanelContainer) {
        this.addMessage(message + panel.getTitle());
    }
}

/**
 * Notification View Component Itself
 */
export interface NotificationViewProps {
    dockManager: DockManager;
}

const NotificationView = (props: NotificationViewProps) => {

    const [messages, setMessages] = React.useState([]);

    React.useEffect(() => {
        const notificationListener = new NotificationListener(props.dockManager, message => {
            setMessages(messages => messages.concat([message]));
        });
    }, []);

    return (
        <div className="NotificationView">
            {messages.map((message, index) => {
                return (
                    <div className="NotificationView__Message" key={index} >
                        {message}
                    </div>
                )
            })}
        </div>
    );
}


/**
 *  Notification View Factory Function
 */
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
