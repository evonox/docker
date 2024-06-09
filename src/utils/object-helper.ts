
import defaultsDeep from "../lodash/defaultsDeep";

/**
 * To save the docking library bundle size we use the custom Lodash Build
 * This helper is introduced in case of exchanging this library
 */
export class ObjectHelper {

    static defaultsDeep(...args: any[]): any {
        return defaultsDeep(...args);
    }

    static bindAllFunctionsToContext(fnObject: any, thisObj: any) {
        for(let propertyName in fnObject) {
            if(typeof fnObject[propertyName] === "function") {
                fnObject[propertyName] = fnObject[propertyName].bind(thisObj);
            }
        }
    }
}
