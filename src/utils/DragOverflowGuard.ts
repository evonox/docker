
export enum OverflowDirection { Decrementing, Incrementing };

export enum DragOverflowState { NotInOverflowState , OverflowStateTerminated, InOverflowState  }

export class DragOverflowGuard {

    private isInOverflow: boolean = false;
    private overflowDirection: OverflowDirection;
    private guardedCoordinate: number;

    reset() {
        this.isInOverflow = false;
    }

    startDragOverflow(coordinate: number, direction: OverflowDirection) {
        if(this.isInOverflow === true)
            return;
        this.isInOverflow = true;
        this.guardedCoordinate = coordinate;
        this.overflowDirection = direction;
    }

    isInDragOverflow(currentCoordinate: number): DragOverflowState {
        if(this.isInOverflow === false)
            return DragOverflowState.NotInOverflowState;
        if(this.overflowDirection === OverflowDirection.Incrementing) {
            return currentCoordinate >= this.guardedCoordinate 
                ? DragOverflowState.InOverflowState : DragOverflowState.OverflowStateTerminated;
        } else if(this.overflowDirection === OverflowDirection.Decrementing) {
            return currentCoordinate <= this.guardedCoordinate 
                ? DragOverflowState.InOverflowState : DragOverflowState.OverflowStateTerminated;
        }
    }

    adjustDeltaAfterOverflow(delta: number, currentCoordinate: number) {
        if(this.isInOverflow === false) {
            return delta;
        } else {
            if(this.overflowDirection === OverflowDirection.Incrementing) {
                return currentCoordinate - this.guardedCoordinate;
            } else if(this.overflowDirection === OverflowDirection.Decrementing) {
                return currentCoordinate - this.guardedCoordinate;
            }  
        }
    }
}
