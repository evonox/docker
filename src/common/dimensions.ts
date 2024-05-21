
/**
 * Point Interface
 */
export interface IPoint {
    x: number;
    y: number;
}

/**
 * Size interface
 */
export interface ISize {
    w: number;
    h: number;
}

/**
 * Rect interface
 */
export interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Delta Point Interface - used to change dialog's position
 */
export interface IDeltaPoint {
    dx: number;
    dy: number;
}

/**
 * Delta Rect Interface - used for resizing
 */
export interface IDeltaRect {
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}
