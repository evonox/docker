

export class EventHelper {

    static suppressEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
}
