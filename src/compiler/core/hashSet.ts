///<reference path='references.ts' />

module TypeScript.Collections {
    export var DefaultHashSetCapacity = 8;

    class HashSetEntry<TValue> {
        constructor(
            public Value: TValue,
            public HashCode: number,
            public Next: HashSetEntry<TValue>) {
        }
    }

    export interface IEnumerator<T> {
        moveNext(): boolean;
        current(): T;
    }

    export interface IEnumerable<T> {
        getEnumerator(): IEnumerator<T>;
    }

    export interface ISet<T> extends IEnumerable<T> {
        add(value: T): void;
        addRange(values: T[]): void;
        contains(value: T): boolean;
        count(): number;
        equals(set: ISet<T>): boolean;
    }

    class Enumerator<TValue> implements IEnumerator<TValue> {
        private index: number = -1;

        constructor(private hashSet: HashSet<TValue>) {
        }

        public moveNext(): boolean {
            var entries = this.hashSet.entries;

            while (true) {
                this.index++;
                if (this.index >= entries.length) {
                    return false;
                }

                if (entries[this.index]) {
                    return true;
                }
            }
        }

        public current(): TValue {
            return this.hashSet.entries[this.index].Value;
        }
    }

    class HashSet<TValue> implements ISet<TValue> {
        public entries: HashSetEntry<TValue>[];
        private _count: number = 0;

        constructor(capacity: number,
                    private hash: (v: TValue) => number) {
            var size = Hash.getPrime(capacity);
            this.entries = ArrayUtilities.createArray(size, null);
        }

        public count(): number {
            return this._count;
        }

        public getEnumerator(): IEnumerator<TValue> {
            return new Enumerator(this);
        }

        public contains(value: TValue): boolean {
            var hashCode = this.computeHashCode(value);
            var entry = this.findEntry(value, hashCode);
            return entry !== null;
        }

        private computeHashCode(value: TValue): number {
            var hashCode: number = this.hash === null
                ? (<any>value).hashCode
                : this.hash(value);

            hashCode = hashCode & 0x7FFFFFFF;
            Debug.assert(hashCode >= 0);

            return hashCode;
        }

        public addRange(values: TValue[]): void {
            for (var i = 0, n = values.length; i < n; i++) {
                this.add(values[i]);
            }
        }

        public add(value: TValue): void {
            // Compute the hash for this key.  Also ensure that it's non negative.
            var hashCode = this.computeHashCode(value);

            var entry = this.findEntry(value, hashCode);
            if (entry !== null) {
                entry.Value = value;
                return;
            }

            this.addEntry(value, hashCode);
        }

        private findEntry(value: TValue, hashCode: number): HashSetEntry<TValue> {
            for (var e = this.entries[hashCode % this.entries.length]; e !== null; e = e.Next) {
                if (e.HashCode === hashCode &&
                    value === e.Value) {

                    return e;
                }
            }

            return null;
        }

        private addEntry(value: TValue, hashCode: number): void {
            var index = hashCode % this.entries.length;

            var e = new HashSetEntry<TValue>(value, hashCode, this.entries[index]);

            this.entries[index] = e;

            if (this._count >= (this.entries.length / 2)) {
                this.grow();
            }

            this._count++;
        }

        //private dumpStats() {
        //    var standardOut = Environment.standardOut;

        //    standardOut.WriteLine("----------------------")
        //    standardOut.WriteLine("Hash table stats");
        //    standardOut.WriteLine("Count            : " + this.count);
        //    standardOut.WriteLine("Entries Length   : " + this.entries.length);

        //    var occupiedSlots = 0;
        //    for (var i = 0; i < this.entries.length; i++) {
        //        if (this.entries[i] !== null) {
        //            occupiedSlots++;
        //        }
        //    }

        //    standardOut.WriteLine("Occupied slots   : " + occupiedSlots);
        //    standardOut.WriteLine("Avg Length/Slot  : " + (this.count / occupiedSlots));
        //    standardOut.WriteLine("----------------------");
        //}

        private grow(): void {
            //this.dumpStats();

            var newSize = Hash.expandPrime(this.entries.length);

            var oldEntries = this.entries;
            var newEntries: HashSetEntry<TValue>[] = ArrayUtilities.createArray(newSize, null);

            this.entries = newEntries;

            for (var i = 0; i < oldEntries.length; i++) {
                var e = oldEntries[i];

                while (e !== null) {
                    var newIndex = e.HashCode % newSize;
                    var tmp = e.Next;
                    e.Next = newEntries[newIndex];
                    newEntries[newIndex] = e;
                    e = tmp;
                }
            }

            //this.dumpStats();
        }

        public equals(set: ISet<TValue>): boolean {
            if (this.count() !== set.count()) {
                return false;
            }

            for (var e = set.getEnumerator(); e.moveNext();) {
                if (!this.contains(e.current())) {
                    return false;
                }
            }

            return true;
        }
    }

    export function createHashSet<TValue>(capacity: number = DefaultHashSetCapacity,
                                          hash: (k: TValue) => number = null): ISet<TValue> {
        return new HashSet<TValue>(capacity, hash);
    }
}