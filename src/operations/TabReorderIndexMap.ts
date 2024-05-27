

/**
 * Helper data structure for tracking tab reorder during the reorder operation
 */
export class TabReorderIndexMap {

    private indexes: number[] = [];

    constructor(private count: number) {
        for(let i = 0; i < count; i++) {
            this.indexes.push(i);
        }
    }

    applyReorderLeft(toIndex: number): void {
        const curr = this.indexes[toIndex];
        this.indexes[toIndex + 1] = this.indexes[toIndex];
        this.indexes[toIndex] = curr;
    }

    applyReorderRight(toIndex: number): void {
        const curr = this.indexes[toIndex];
        this.indexes[toIndex - 1] = this.indexes[toIndex];
        this.indexes[toIndex] = curr;
    }

    mapToReordered(index: number): number {
        return this.indexes[index];
    }

    unmapFromReordered(index: number): number {
        for(let srcIndex = 0; srcIndex < this.count; srcIndex++) {
            if(this.indexes[srcIndex] === index)
                return srcIndex;
        }
    }
}
