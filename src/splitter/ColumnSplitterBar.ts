import { IDockContainer } from "../common/declarations";
import { OrientationKind } from "../common/enumerations";
import { SplitterBarBase } from "./SplitterBarBase";


/**
 * Splitter Bar For Column-Oriented Splitter Panel
 */
export class ColumnSpliterBar extends SplitterBarBase {

    /**
     * Public API
     */
    public getBarSize() {
        return this.domBar.getHeight();
    }

    /**
     * Overrided Abstract Methods
     */    

    protected getOrientation(): OrientationKind {
        return OrientationKind.Column;
    }

    protected getSplitterBarCSSClass(): string {
        return "DockerTS-SplitterBar--Column";
    }

    protected getResizeMouseCursor(): string {
        return "row-resize";
    }

    protected isVaryingDimMinimumOverflow(): boolean {
        return this.splitterPanel.isMinimumSizeOverflow();
    }

    protected getLastVaryingCoordinate(): number {
        return this.lastPosY;
    }

    protected getVaryingCoordinate(event: MouseEvent): number {
        return event.pageY;
    }

    protected getMinimumContainerSize(container: IDockContainer): number {
        return container.getMinHeight();
    }
}
