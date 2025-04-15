;let Flyy = (function() {

    class Bucket {
        
        constructor(initial = {}) {
            this.bucket = initial;
        }

        get(key, def) {
            return this.bucket[key] ?? def;
        }

        put(key, value) {
            this.bucket[key] = value;
            return this;
        }

        cut(key) {
            delete this.bucket[key];
            return this;
        }

        take(key) {
            let value = this.get(key);
            this.cut(key);
            return value;
        }
    
    }

    class Brigade {

        constructor(initial = [], intake = null) {
            if(intake !== null) {
                this.entries = initial.map(intake);
            } else this.entries = initial;
        }

        all() {
            return this.entries;
        }

        get(picker = null) {
            if(isFinite(picker) == true) {
                return this.entries[picker];
            } 
            if(typeof picker == 'function') {
                return this.entries.filter(picker)
            }
            return null
        }

        first() {
            return this.entries[0]
        }

        last() {
            return this.entries[this.size() - 1];
        }

        size() {
            return this.entries.length;
        }

        put(entries = [], at = null) {
            if(at === null) {
                this.entries.push(...entries);
            } else {
                this.entries.splice(at, 0, ...entries);
            }
            return this;
        }

        cut(picker = null, much = 1) {
            if(isFinite(picker) == true) {
                this.entries.splice(picker, much);
            } 
            if(Array.isArray(picker) == true) {
                this.entries.splice(picker[0], picker[1] ?? much);
            }
            if(typeof picker == 'function') {
                this.entries = this.entries.filter(picker)
            }
            return this;
        }

        unique() {
            this.entries = Array.from(new Set(this.entries));
            return this;
        }

    }

    class Flyy {

        constructor(initial, intake) {
            if(Array.isArray(initial) == true) {
                return Flyy.brigade(initial, intake);
            } else {
                return Flyy.bucket(initial, intake);
            }
        }

        static bucket(initial = {}, intake = null) {
            return new Bucket(initial);
        }

        static brigade(initial = [], intake = null) {
            return new Brigade(initial, intake);
        }
    }

    return Flyy;
}());