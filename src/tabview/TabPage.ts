import { Component } from "../framework/Component";
import { ComponentEventSubscription } from "../framework/component-events";
import { state } from "../framework/decorators";
import { IDockContainer } from "../common/declarations";
import { TabHandle } from "./TabHandle";
import { DOM } from "../utils/DOM";


export class TabPage extends Component {

    @state({defaultValue: false})
    selected: boolean;

    private domContentWrapper: DOM<HTMLElement>;

    private tabHandle: TabHandle;
    private titleSubscription: ComponentEventSubscription;

    constructor(private container: IDockContainer) {
        super();
        this.initializeComponent();
    }

    getContainer(): IDockContainer {
        return this.container;
    }

    setActive(flag: boolean) {
        this.tabHandle.setActive(flag);
    }

    setSelected(flag: boolean, isActive: boolean) {
        this.selected = flag;
        this.tabHandle.setSelected(flag);

        if(this.selected) {
            this.container.setVisible(true);
            // TODO: FORCE RESIZE - QUERY SIZE FROM THE HOST??
            // TODO: SET ACTIVE PANEL TO DOCK CONTAINER
        }
        else {
            this.container.setVisible(false);
        }
    }

    resize(width: number, height: number) {
        this.container.resize(width, height);
    }

    protected onInitialized(): void {
        this.tabHandle = new TabHandle();
        this.tabHandle.on("onSelected", this.handleTabSelected);
        this.tabHandle.on("onTabMoved", this.handleTabMoved);

        this.titleSubscription = this.container.on("onTitleChanged", this.handleTitleChanged);
    }

    protected onDisposed(): void {
        this.tabHandle.dispose();
        this.titleSubscription.unsubscribe();
    }

    protected onInitialRender(): HTMLElement {
        this.domContentWrapper = DOM.create("div").appendChild(this.container.getDOM());
        return this.domContentWrapper.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private handleTabSelected() {
        this.triggerEvent("onTabPageSelected", {tabPage: this, isActive: true});
        // DOCK CONTAINER - NOTIFY ON TAB CHANGED
    }

    private handleTitleChanged(title: string) {
        this.tabHandle.title = title;
        this.tabHandle.hasPanelChanges = this.container.hasChanges();
    }

    private handleTabMoved(payload: any) {
        this.triggerEvent("onTabMoved", payload);
    }
}
