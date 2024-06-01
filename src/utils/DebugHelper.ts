


export class DebugHelper {

    static printStackTrace() {
        const error = new Error();
        console.dir(error.stack);
    }

    static startMeasuring(): number {
        return performance.now();
    }

    static stopMeasuring(startTime: number, detail: string) {
        const deltaInMS = performance.now() - startTime;
        console.log(`${detail}: ${deltaInMS.toFixed(3)} ms`);
    }

}