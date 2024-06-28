import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { SplitterPanelBase } from "./SplitterPanelBase";
import { MathHelper } from "../utils/math-helper";
import { OrientationKind } from "../common/enumerations";
import { RowSplitterBar } from "./RowSplitterBar";
import { SplitterBarBase } from "./SplitterBarBase";

export class RowSplitterPanel extends SplitterPanelBase {

    /**
     * Helper Metrics Methods
     */
    protected createSplitterBar(prevContainer: IDockContainer, nextContainer: IDockContainer): SplitterBarBase {
        return new RowSplitterBar(this, prevContainer, nextContainer);
    }


    public getOrientation(): OrientationKind {
        return OrientationKind.Row;
    }

    public isMinimumSizeOverflow(): boolean {
        const requiredMinWidth = this.getTotalMinimumRequiredSize();
        return requiredMinWidth >= this.domSplitterPanel.getWidth();
    }

    protected getTotalMinimumRequiredSize(): number {
        return MathHelper.sum(
            this.childContainers.map(child => child.getMinWidth())
        );
    }

    protected getContainerMinimumSize(childContainer: IDockContainer): number {
        return childContainer.getMinWidth();
    }

    protected getElementVaryingSize(element: DOM<HTMLElement> | HTMLElement): number {
        if(element instanceof HTMLElement) {
            element = DOM.from(element);
        }
        return element.getWidth();
    }
}
