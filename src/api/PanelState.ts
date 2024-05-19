import { IPanelState } from "../common/panel-api";

/**
 * Helper Container Class to manage the client panel's persistent state
 */
export class PanelState implements IPanelState {

    constructor(private state: any = {}) {}

    getValue(key: string, defaultValue?: any) {
        return this.state[key] ?? defaultValue;
    }

    setValue(key: string, value: any): void {
        this.state[key] = value;
    }

    getState() {
        return {...this.state};
    }
}