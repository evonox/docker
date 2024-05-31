


export class MathHelper {

    static round(value: number, decimalPlaces: number): number {
        const presision = Math.pow(10, decimalPlaces);
        return Math.floor(value * presision) / presision;
    }

    static sum(arr: number[]): number {
        let sum = 0;
        for(let i = 0; i < arr.length; i++) {
            console.dir(arr[i]);
            sum += arr[i];
        }
        return sum;
    }
}