

/**
 * Debugging Helper Class
 */
export class DebugHelper {

    private static  _isReportingStaticticsEnabled = false;
    private static _isClassListCacheEnabled = true;
    private static _isCSSStyleCacheEnabled = true;
    private static _isQueuedDOMUpdatesEnabled = true;

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

    static reportCacheStatistics(flag: boolean) {
        this._isReportingStaticticsEnabled = flag;
    }

    static enableOptimizations(flag: boolean) {
        this.enableClassListCache(flag);
        this.enableCSSStyleCache(flag);
        this.enableQueuedDOMUpdates(flag);
    }

    static enableClassListCache(flag: boolean) {
        this._isClassListCacheEnabled = flag;
    }

    static enableCSSStyleCache(flag: boolean) {
        this._isCSSStyleCacheEnabled = flag;
    }

    static enableQueuedDOMUpdates(flag: boolean) {
        this._isQueuedDOMUpdatesEnabled = flag;
    }

    static isDOMQueuedUpdatesEnabled() {
        return this._isQueuedDOMUpdatesEnabled;
    }

    static isClassListCacheEnabled() {
        return this._isClassListCacheEnabled;
    }

    static isCSSStyleCacheEnabled() {
        return this._isCSSStyleCacheEnabled;
    }
}
