import { ResizeHandle, ResizeHandleType } from "./ResizeHandle";

// Interface for resize cursor record
interface ResizingMouseCursor {
    handleType: ResizeHandleType;
    cursor: string;
}

// Resize cursor map
const RESIZE_MOUSE_CURSORS: ResizingMouseCursor[] = [
    // Border Resizing
    {handleType: {north: true, south: false, east: false, west: false}, cursor: "n-resize"},
    {handleType: {north: false, south: true, east: false, west: false}, cursor: "s-resize"},
    {handleType: {north: false, south: false, east: true, west: false}, cursor: "e-resize"},
    {handleType: {north: false, south: false, east: false, west: true}, cursor: "w-resize"},
    // Corner Resizing
    {handleType: {north: true, south: false, east: true, west: false}, cursor: "ne-resize"},
    {handleType: {north: true, south: false, east: false, west: true}, cursor: "nw-resize"},
    {handleType: {north: false, south: true, east: true, west: false}, cursor: "se-resize"},
    {handleType: {north: false, south: true, east: false, west: true}, cursor: "sw-resize"},
];

export function queryResizeMouseCursor(handle: ResizeHandle) {
    const record = RESIZE_MOUSE_CURSORS.find(rec => {
        return handle.north() === rec.handleType.north && handle.south() === rec.handleType.south &&
            handle.east() === rec.handleType.east && handle.west() === rec.handleType.west
    });
    if(record === undefined)
        throw new Error("ERROR: Mouse Cursor for given handle not found.");
    return record.cursor;
}
