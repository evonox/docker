
/**
 * Enumeration Declarations
 */

export enum SelectionState {
    Unselected = "unselected",
    Selected = "selected",
    Focused = "focused"     // panel is selected and is accepting the user input
}

export enum PanelContainerState { 
    Docked = "docked", 
    Floating = "floating", 
    Minimized = "minimized", 
    Maximized = "maximized",
    InCollapser = "in-collapser",
    PopupWindow = "popup-window"
 }

export enum DockKind { Left = "left", Right = "right", Up = "up", Down = "down", Fill = "fill" };

export enum OrientationKind { Row = "row", Column = "column", Fill = "fill" };

export enum TabOrientation { 
    Top = "top", 
    Bottom = "bottom", 
    Left = "left", 
    Right = "right" 
};

export enum ContainerType { Panel = "panel", RowLayout = "row", ColumnLayout = "column", FillLayout = "fill" }

export enum WheelTypes {
    Left = "left", Right = "right", Top = "top", Bottom = "bottom", Fill = "fill",
    SideLeft = "side-left", SideRight = "side-right", SideTop = "side-top", SideBottom = "side-bottom"
}
