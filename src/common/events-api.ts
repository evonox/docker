import type { DockManager } from "../DockManager";
import type { PanelContainer } from "../containers/PanelContainer";
import type { Dialog } from "../floating/Dialog";
import type { DockNode } from "../model/DockNode";
import type { TabPage } from "../tabview/TabPage";
import type { IDockContainer, IPoint } from "./declarations";

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
    "onActiveDocumentChange": ActivePanelChanged 
}

/**
 * Supported event kinds by the Dock Manager
 */
export type EventKind = keyof EventPayloadMap;

export type EventPayload<K extends EventKind> = EventPayloadMap[K];
