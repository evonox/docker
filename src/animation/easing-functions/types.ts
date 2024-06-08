/**
 * All easings must return the current value given the start and end values, and
 * a percentage complete. The property name is also passed in case that makes a
 * difference to how values are used.
 *
 * @param percentComplete Between 0 and 1 inclusive.
 * @param startValue The value at 0.
 * @param endValue The value at 1.
 * @param property The property name.
 */
export type VelocityEasingFn = (
	percentComplete: number,
	startValue: number,
	endValue: number,
	property?: string) => number;

/**
 * Check if a variable is a function.
 */
export function isFunction(variable: any): variable is Function { // tslint:disable-line:ban-types
	return Object.prototype.toString.call(variable) === "[object Function]";
}

/**
 * Check if a variable is a string.
 */
export function isString(variable: any): variable is string {
	return typeof variable === "string";
}