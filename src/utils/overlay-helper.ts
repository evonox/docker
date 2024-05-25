
export interface IPoint {
    x: number;
    y: number;
}

enum HorizontalAlignment { Left, Center, Right };
enum VerticalAlignment { Top, Center, Bottom };

interface IPosition {
    alignmentX: HorizontalAlignment;
    alignmentY: VerticalAlignment;
    offsetX: number;
    offsetY: number;
}

/**
 * Overlay Position Parser
 */
export class OverlayHelper {

    static computeOverlayAnchor(domTarget: HTMLElement, positionAt: string): IPoint {
        const position = this.parsePosition(positionAt);
        const domRect = domTarget.getBoundingClientRect();
        const point = this.computeOverlayAnchorPoint(domRect, position);
        return point;
    }

    private static computeOverlayAnchorPoint(domRect: DOMRect, position: IPosition): IPoint {
        let x = domRect.left;
        if(position.alignmentX === HorizontalAlignment.Center) {
            x = domRect.left + domRect.width / 2;
        } else if(position.alignmentX ===HorizontalAlignment.Right) x = domRect.right;

        let y = domRect.top;
        if(position.alignmentY === VerticalAlignment.Center) {
            y = domRect.top + domRect.height / 2;
        } else if(position.alignmentY === VerticalAlignment.Bottom) y = domRect.bottom;

        return {
            x: x + position.offsetX,
            y: y + position.offsetY
        };
    }

    static computeFinalOverlayPosition(anchor: IPoint, domOverlay: HTMLElement, positionMy: string): IPoint {
        const position = this.parsePosition(positionMy);
        const domRect = domOverlay.getBoundingClientRect();
        const point = this.computeOverlayPosition(anchor, domRect, position);
        return point
    }

    private static computeOverlayPosition(anchor: IPoint, rect: DOMRect, position: IPosition): IPoint {
        // Create local copy of anchor for computations
        const overlayAnchor = {...anchor};

        if(position.alignmentX === HorizontalAlignment.Center) 
            overlayAnchor.x -= rect.width / 2;
        else if(position.alignmentX === HorizontalAlignment.Right) 
            overlayAnchor.x -= rect.width;

        if(position.alignmentY === VerticalAlignment.Center)
            overlayAnchor.y -= rect.height / 2;
        else if(position.alignmentY === VerticalAlignment.Bottom)
            overlayAnchor.y -= rect.height;

        const computedPosition: IPoint = {x: 0, y: 0};
        computedPosition.x = Math.round(overlayAnchor.x + position.offsetX);
        computedPosition.y = Math.round(overlayAnchor.y + position.offsetY);

        return computedPosition;
    }

    private static parsePosition(position: string): IPosition {
        const parts = position.split(",");
        if(parts.length !== 2)
            throw new Error("Malformed alignment position");
        
        const [horizontalAlignment, offsetX] = this.parsePositionPart(parts[0]);
        const [verticalAlignment, offsetY] = this.parsePositionPart(parts[1]);
        const alignmentX = this.translateHorizontalAlignment(horizontalAlignment);
        const alignmentY = this.translateVerticalAlignment(verticalAlignment);

        return { alignmentX, offsetX, alignmentY, offsetY};
    }

    private static parsePositionPart(positionPart: string): [string, number] {
        const parts = positionPart.split(/[\+\-]/);
        const alignment = parts[0].trim();
        if(parts.length === 1) {
            return [alignment, 0];
        } else {
            let offset = parseInt(parts[1]);
            if(isNaN(offset))
                throw new Error(`Offset not a number`);
            if(positionPart.includes("-"))
                offset = - offset;
            return [alignment, offset];
        }
    }

    private static translateHorizontalAlignment(alignment: string): HorizontalAlignment {
        alignment = alignment.toLowerCase();
        switch(alignment) {
            case "left": return HorizontalAlignment.Left;
            case "center": return HorizontalAlignment.Center;
            case "right": return HorizontalAlignment.Right;
            default: throw new Error(`Undefined horizontal alignment`);
        }
    }

    private static translateVerticalAlignment(alignment: string): VerticalAlignment {
        alignment = alignment.toLowerCase();
        switch(alignment) {
            case "top": return VerticalAlignment.Top;
            case "middle": return VerticalAlignment.Center;
            case "bottom": return VerticalAlignment.Bottom;
            default: throw new Error(`Undefined vertical alignment`);
        }
    }
}
