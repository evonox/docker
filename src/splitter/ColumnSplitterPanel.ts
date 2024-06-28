import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { SplitterPanelBase } from "./SplitterPanelBase";
import { MathHelper } from "../utils/math-helper";
import { OrientationKind } from "../common/enumerations";
import { ColumnSpliterBar } from "./ColumnSplitterBar";
import { SplitterBarBase } from "./SplitterBarBase";


export class ColumnSplitterPanel extends SplitterPanelBase {

    /**
     * Helper Metrics Methods
     */

    protected createSplitterBar(prevContainer: IDockContainer, nextContainer: IDockContainer): SplitterBarBase {
        return new ColumnSpliterBar(this, prevContainer, nextContainer);
    }

    public getOrientation(): OrientationKind {
        return OrientationKind.Column;
    }

    public isMinimumSizeOverflow(): boolean {
        const requiredMinHeight = this.getTotalMinimumRequiredSize();
        return requiredMinHeight >= this.domSplitterPanel.getHeight();
    }

    protected getTotalMinimumRequiredSize(): number {
        return MathHelper.sum(
            this.childContainers.map(child => child.getMinHeight())
        );
    }

    protected getContainerMinimumSize(childContainer: IDockContainer): number {
        return childContainer.getMinHeight();
    }

    protected getElementVaryingSize(element: DOM<HTMLElement> | HTMLElement): number {
        if(element instanceof HTMLElement) {
            element = DOM.from(element);
        }
        return element.getHeight();
    }
}
