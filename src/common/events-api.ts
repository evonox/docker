import type { DockManager } from "../facade/DockManager";
import type { PanelContainer } from "../containers/PanelContainer";
import type { Dialog } from "../floating/Dialog";
import type { DockNode } from "../model/DockNode";
import type { TabPage } from "../tabview/TabPage";
import type { IDockContainer } from "./declarations";
import { IPoint } from "./dimensions";

/**
 * Various interface definitons of payloads carrying event data
 */

export interface GenericPayload {
    dockManager: DockManager;
}

export interface PanelContainerPayload extends GenericPayload {
    panel: PanelContainer;
}

export interface DockNodePayload extends GenericPayload {
    node: DockNode;
}

export interface DialogPayload extends GenericPayload {
    dialog: Dialog;
}

export interface DialogPositionPayload extends DialogPayload {
    position: IPoint;
}

export interface ContainerPayload extends GenericPayload {
    container: IDockContainer;
}

export interface TabPagePayload extends GenericPayload {
    tabPage: TabPage;
}

export interface ActivePanelChanged extends GenericPayload {
    previousActivePanel: PanelContainer;
    activePanel: PanelContainer;
}

/**
 * Event Payload Type Mapping
 */

export interface EventPayloadMap {
    "onSuspendLayout": ContainerPayload,
    "onResumeLayout": ContainerPayload,
    "onDock": DockNodePayload,
    "onUndock": DockNodePayload,
    "onTabReorder": DockNodePayload,
    "onTabChange": TabPagePayload,
    "onClosePanel": PanelContainerPayload,
    "onCreateDialog": DialogPayload,
    "onShowDialog": DialogPayload,
    "onHideDialog": DialogPayload,
    "onChangeDialogPosition": DialogPositionPayload,
    "onContainerResized": ContainerPayload,
    "onActivePanelChange": ActivePanelChanged,
    "onActiveDocumentChange": ActivePanelChanged,
    /////////
    "onLayoutChanged": GenericPayload,
    "onPinned": ContainerPayload,
    "onUnpinned": ContainerPayload,
    "onUndockToPopup": ContainerPayload,
    "onDockFromPopup": ContainerPayload,
    "onMinimized": ContainerPayload,
    "onRestored": ContainerPayload,
    "onMaximized": ContainerPayload,
    "onCollapsed": ContainerPayload,
    "onExpanded": ContainerPayload
}

/**
 * Supported event kinds by the Dock Manager
 */
export type EventKind = keyof EventPayloadMap;

export type EventPayload<K extends EventKind> = EventPayloadMap[K];
