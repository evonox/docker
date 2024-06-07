import { DockKind } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { AnimationHelper } from "../utils/animation-helper";

import "./CollapserMargin.css";

/**
 * Collapser Margin where collapsed panel headers are attached to
 */
export class CollapserMargin extends Component {

    private domRoot: DOM<HTMLElement>;

    constructor(private dockManager: DockManager, private collapseKind: DockKind) {
        super();
        if(this.collapseKind === DockKind.Up || this.collapseKind === DockKind.Fill)
            throw new Error("Invalid collapseKind value");
        this.initializeComponent();
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domRoot = DOM.create("div")
            .applyClasses({
                "DockerTS-CollapserMargin": true,
                "DockerTS-CollapserMargin--Left": this.collapseKind === DockKind.Left,
                "DockerTS-CollapserMargin--Right": this.collapseKind === DockKind.Right,
                "DockerTS-CollapserMargin--Down": this.collapseKind === DockKind.Down
            })
            .hide();
        return this.domRoot.get();
    }
    
    protected onUpdate(element: HTMLElement): void {}

    /**
     * Public API
     */

    getMarginKind(): DockKind {
        return this.collapseKind;
    }

    appendHeader(domHeader: HTMLElement) {
        if(this.containsMarginAnyHeader() === false) {
            this.show();
        }
        this.domRoot.appendChild(domHeader);
    }

    removeHeader(domHeader: HTMLElement) {
        domHeader.remove();
        if(this.containsMarginAnyHeader() === false) {
            this.hide();
        }
    }
       
    async show(): Promise<void> {
        this.domRoot.show();
        const thickness = this.dockManager.config.collapserMarginSize;
        await this.animateCollapserMargin(thickness);
    }

    async hide(): Promise<void> {
        await this.animateCollapserMargin(0);
        this.domRoot.hide();
    }

    /**
     *  Misc private helper methods
     */

    private containsMarginAnyHeader(): boolean {
        return this.domRoot.get().childElementCount > 0;
    }

    private async animateCollapserMargin(thickness: number): Promise<void> {
        const domContainer = this.dockManager.getContainerElement();
        const propertyName = this.getAnimationProperty();
        await AnimationHelper.animateCollapserMargin(domContainer, propertyName, thickness);
    }

    private getAnimationProperty() {
        switch(this.collapseKind) {
            case DockKind.Left: return "left";
            case DockKind.Right: return "right";
            case DockKind.Down: return "bottom";
        }
    }
}
