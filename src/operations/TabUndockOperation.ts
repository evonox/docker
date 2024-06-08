import { IPoint } from "../common/dimensions";
import { PanelContainer } from "../containers/PanelContainer";
import { TabHandle } from "../tabview/TabHandle";


export class TabUndockOperation {

    constructor(private draggedPanel: PanelContainer, private dragOffset: IPoint) {}

    async processMouseDown(event: MouseEvent) {
        await this.draggedPanel.requestUndockToDialog(event, this.dragOffset);
        this.draggedPanel.triggerEvent("onDockingDragStart", event);       
    }

    processMouseMove(event: MouseEvent) {
        this.draggedPanel.triggerEvent("onDockingDragMove", event);
    }

    processMouseUp(event: MouseEvent) {
        this.draggedPanel.triggerEvent("onDockingDragStop", event);
    }

    processCancelRequest() {
        
    }
}
