import { WheelTypes } from "../common/enumerations";
import { Component } from "../framework/Component";
import { property } from "../framework/decorators";
import { DOM } from "../utils/DOM";

import "./DockWheelItem.css";

export class DockWheelItem extends Component {

    private domWheelItem: DOM<HTMLElement>;

    @property({defaultValue: false})
    active: boolean;

    constructor(private wheelType: WheelTypes, private zIndex: number) {
        super();
        this.initializeComponent();
    }

    getWheelType() {
        return this.wheelType;
    }

    isSideWheelItem() {
        return this.wheelType === WheelTypes.SideTop ||
            this.wheelType === WheelTypes.SideBottom ||
            this.wheelType === WheelTypes.SideLeft ||
            this.wheelType === WheelTypes.SideRight;
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domWheelItem = DOM.create("div").addClasses(["dock-wheel-item", "DockerTS--DisableSelection"])
            .addClasses(this.getWheelItemCssClasses())
            .zIndex(this.zIndex);
        
        this.bind(this.domWheelItem.get(), "mouseenter", this.handleMouseEnter.bind(this));
        this.bind(this.domWheelItem.get(), "mouseleave", this.handleMouseLeave.bind(this));

        return this.domWheelItem.get();       
    }

    private getWheelItemCssClasses() {
        const classNamePart = this.getCssClassPart();
        return [
            `dock-wheel-${classNamePart}`,
            `dock-wheel-${classNamePart}-icon`
        ];
    }

    private getWheelItemIcon() {
        const classNamePart = this.getCssClassPart();
        return `dock-wheel-${classNamePart}-icon`;
    }

    private getWheelItemHoverIcon() {
        const classNamePart = this.getCssClassPart();
        return `dock-wheel-${classNamePart}-icon-hover`;
    }

    private getCssClassPart(): string {
        switch(this.wheelType) {
            case WheelTypes.Bottom:
            case WheelTypes.SideBottom:
                return "down";
            case WheelTypes.Fill:
                return "fill";
            case WheelTypes.Left:
            case WheelTypes.SideLeft:
                return "left";
            case WheelTypes.Right:
            case WheelTypes.SideRight:
                return "right";
            case WheelTypes.Top:
            case WheelTypes.SideTop:
                return "top";
        }
    }

    protected onUpdate(element: HTMLElement): void {
        this.domWheelItem.toggleClass(this.getWheelItemIcon(), ! this.active);
        this.domWheelItem.toggleClass(this.getWheelItemHoverIcon(), this.active);
    }

    private handleMouseEnter(event: MouseEvent) {
        this.active = true;
        this.triggerEvent("onMouseEnter", {wheelItem: this, event});
    }

    private handleMouseLeave(event: MouseEvent) {
        this.active = false;
        this.triggerEvent("onMouseLeave", {wheelItem: this, event});
    }
}
