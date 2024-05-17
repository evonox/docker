
export function component() {
    return function(target: any) {
        return target;
    }
}

export function property(opts?: {defaultValue?: any}) {
    return function(target: any, propertyName: string) {

        const attributeSymbol = Symbol();
        target[attributeSymbol] = opts?.defaultValue;

        Object.defineProperty(target, propertyName, {
            enumerable: true,
            get: () => target[attributeSymbol],
            set: (value) => {
                target[attributeSymbol] = value;
                target.requestUpdate();
            }
        })

        return target;
    }
}

export function state(opts?: {defaultValue?: any}) {
    return function(target: any, stateName: string) {

        const attributeSymbol = Symbol();
        target[attributeSymbol] = opts?.defaultValue;

        Object.defineProperty(target, stateName, {
            enumerable: false,
            get: () => target[attributeSymbol],
            set: (value) => {
                target[attributeSymbol] = value;
                target.requestUpdate();
            }
        })

        return target;
    }
}
