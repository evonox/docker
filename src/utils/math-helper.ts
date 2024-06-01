
const PIXEL_FRACTION_DIGITS = 1;

export class MathHelper {

    static round(value: number, decimalPlaces: number): number {
        const presision = Math.pow(10, decimalPlaces);
        return Math.round(value * presision) / presision;
    }

    static roundToPX(value: number): number {
        return this.round(value, PIXEL_FRACTION_DIGITS);
    }

    static sum(arr: number[]): number {
        let sum = 0;
        for(let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }

    static toPX(value: number): string {
        return value.toFixed(PIXEL_FRACTION_DIGITS) + "px";
    }
}
