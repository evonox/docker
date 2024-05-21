import { WheelTypes } from "../common/enumerations";
import { Component } from "../framework/Component";
import { property } from "../framework/decorators";


export class DockWheelItem extends Component {

    @property({defaultValue: false})
    active: boolean;

    constructor(private wheelType: WheelTypes) {
        super();
    }

    isSideWheelItem() {
        return this.wheelType === WheelTypes.SideTop ||
            this.wheelType === WheelTypes.SideBottom ||
            this.wheelType === WheelTypes.SideLeft ||
            this.wheelType === WheelTypes.SideRight;
    }

    protected onInitialized(): void {
        throw new Error("Method not implemented.");
    }
    protected onDisposed(): void {
        throw new Error("Method not implemented.");
    }
    protected onInitialRender(): HTMLElement {
        throw new Error("Method not implemented.");
    }
    protected onUpdate(element: HTMLElement): void {
        throw new Error("Method not implemented.");
    }


}