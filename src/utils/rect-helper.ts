import { IDeltaRect, IRect } from "../common/dimensions";

/**
 * Helper Class to work with rects for sizing purposes
 */
export class RectHelper {

    static isSizeOnly(rect: IRect): boolean {
        return rect.x === null || rect.y === null;
    }

    static round(rect: IRect): IRect {
        return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.w),
            h: Math.round(rect.h)
        };
    }

    static floor(rect: IRect): IRect {
        return {
            x: Math.floor(rect.x),
            y: Math.floor(rect.y),
            w: Math.floor(rect.w),
            h: Math.floor(rect.h)
        };
    }

    static appendDelta(rect: IRect, delta: IDeltaRect): IRect {
        return {
            x: rect.x + delta.dx,
            y: rect.y + delta.dy,
            w: rect.w + delta.dw,
            h: rect.h + delta.dh
        }
    }

    static fromSize(w: number, h: number): IRect {
        return {x: null, y: null, w, h};
    }

    static from(x: number, y: number, w: number, h: number) {
        return {x, y, w, h};
    }

    static fromDOMRect(rect: DOMRect): IRect {
        return {
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height
        };
    }
}
