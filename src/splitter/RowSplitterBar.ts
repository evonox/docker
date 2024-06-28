import { IDockContainer } from "../common/declarations";
import { OrientationKind } from "../common/enumerations";
import { SplitterBarBase } from "./SplitterBarBase";

/**
 * Splitter Bar For Row-Oriented Splitter Panel
 */
export class RowSplitterBar extends SplitterBarBase {

    /**
     * Public API
     */
    public getBarSize() {
        return this.domBar.getWidth();
    }

    /**
     * Overrided Abstract Methods
     */

    protected getOrientation(): OrientationKind {
        return OrientationKind.Row;
    }

    protected getSplitterBarCSSClass(): string {
        return "DockerTS-SplitterBar--Row";
    }

    protected getResizeMouseCursor(): string {
        return "col-resize";
    }

    protected isVaryingDimMinimumOverflow(): boolean {
        return this.splitterPanel.isMinimumSizeOverflow();
    }

    protected getLastVaryingCoordinate(): number {
        return this.lastPosX;
    }

    protected getVaryingCoordinate(event: MouseEvent): number {
        return event.pageX;
    }

    protected getMinimumContainerSize(container: IDockContainer): number {
        return container.getMinWidth();
    }
}
