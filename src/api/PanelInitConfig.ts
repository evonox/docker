import { IInitOptions } from "../common/panel-api";

/**
 * Initial Panel Configuration - used when the panel is being created, passes data from the create method
 */
export class PanelInitConfig implements IInitOptions {

    constructor(private options: any = {}) {}

    getValue(key: string, defaultValue?: any) {
        return this.options[key] === undefined ?  defaultValue : this.options[key];
    }
}