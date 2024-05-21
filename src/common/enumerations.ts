
/**
 * Enumeration Declarations
 */

export enum DockKind { Left = "left", Right = "right", Up = "up", Down = "down", Fill = "fill" };

export enum OrientationKind { Row = "row", Column = "column", Fill = "fill" };

export enum TabHostDirection { Top = "top", Bottom = "bottom", Left = "left", Right = "right" };

export enum ContainerType { Panel = "panel", RowLayout = "row", ColumnLayout = "column", FillLayout = "fill" }

export enum PanelType { Document = "document", Panel = "panel" }

export enum WheelTypes {
    Left = "left", Right = "right", Top = "top", Bottom = "bottom", Fill = "fill",
    SideLeft = "side-left", SideRight = "side-right", SideTop = "side-top", SideBottom = "side-bottom"
}
