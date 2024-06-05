
/**
 * Configuration Object to share data among states and transitions
 */
export class SharedStateConfig {

    private data: any = {};

    get(key: string, defaultValue?: any) {
        return this.data[key] === undefined ? defaultValue : this.data[key];
    }

    set(key: string, value: any) {
        this.data[key] = value;
    }

}