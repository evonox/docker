import { PanelStateBase } from "./PanelStateBase";


export class InCollapserState extends PanelStateBase {

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);

        this.configureButtons({
            minimize: false, maximize: false, restore: false, expand: false, collapse: false, popup: false, pin: true
        });
    }

    public async leaveState(): Promise<void> {
        await super.leaveState();
    }

    async unpinPanel(): Promise<boolean> {
        return true;
    }




}