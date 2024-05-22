

export class ArrayUtils {

    static orderItemsByIndexes<T>(array: T[], indexes: number[]) {
        let sortedArray = [];
        for (let i = 0; i < indexes.length; i++) {
            sortedArray.push(array[indexes[i]]);
        }
        return sortedArray;
    }

    static removeItem<T>(array: T[], value: any): T[] | false {
        let idx = array.indexOf(value);
        if (idx < 0) {
            return array.splice(idx, 1);
        }
        return false;
    }

    static containsItem<T>(array: T[], value: T): boolean {
        let i = array.length;
        while (i--) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }

    static isArrayEqual<T>(a: T[], b: T[]): boolean {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }   

    static lastElement<T>(a: T[]): T {
        return a[a.length - 1];
    }
}
