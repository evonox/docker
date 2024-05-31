import { IDeltaRect, IRect } from "../common/dimensions";

/**
 * Helper Class to work with rects for sizing purposes
 */
export class RectHelper {


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

    static fromDOMRect(rect: DOMRect): IRect {
        return {
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height
        };
    }
}
