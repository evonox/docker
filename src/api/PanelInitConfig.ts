import { IInitOptions } from "../common/panel-api";


export class PanelInitConfig implements IInitOptions {

    constructor(private options: any = {}) {}

    getValue(key: string, defaultValue?: any) {
        return this.options[key] ?? defaultValue;
    }
}