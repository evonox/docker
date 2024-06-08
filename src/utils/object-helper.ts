
import defaultsDeep from "../lodash/defaultsDeep";

/**
 * To save the docking library bundle size we use the custom Lodash Build
 * This helper is introduced in case of exchanging this library
 */
export class ObjectHelper {

    static defaultsDeep(...args: any[]): any {
        return defaultsDeep(...args);
    }
}
