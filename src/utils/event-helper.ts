
import throttle from "../lodash/throttle";
import debounce from "../lodash/debounce";

export class EventHelper {

    static suppressEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    static throttle(func: any, wait: any, options: any): any {
        return throttle(func, wait, options);
    }

    static debounce(func: any, wait: any, options: any): any {
        return debounce(func, wait, options);
    }
}
