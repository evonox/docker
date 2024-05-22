
/**
 * Reactive Property Decorator
 */
export function property(opts?: {defaultValue?: any}) {
    return function(target: any, propertyName: string) {

        const attributeSymbol = Symbol();
        target[attributeSymbol] = opts?.defaultValue;

        Object.defineProperty(target, propertyName, {
            enumerable: true,
            get: function () { return this[attributeSymbol] },
            set: function(value) {
                if(value !== this[attributeSymbol]) {
                    this[attributeSymbol] = value;
                    this.requestUpdate.apply(this, []);
                }
            }
        })

        return target;
    }
}

/**
 * Reactive Component State Decorator
 */
export function state(opts?: {defaultValue?: any}) {
    return function(target: any, stateName: string) {

        const attributeSymbol = Symbol();
        target[attributeSymbol] = opts?.defaultValue;

        Object.defineProperty(target, stateName, {
            enumerable: false,
            get: function () { return this[attributeSymbol] },
            set: function(value) {
                if(value !== this[attributeSymbol]) {
                    this[attributeSymbol] = value;
                    this.requestUpdate.apply(this, []);
                }
            }
        })

        return target;
    }
}
