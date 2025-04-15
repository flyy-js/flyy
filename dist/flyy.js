;let Flyy = (function() {

    class Bucket {
        
        constructor(initial = {}) {
            this.items = initial;
        }

        all() {
            return this.items;
        }

        has(key) {
            if(Array.isArray(key) == true) {
                let has = true;
                key.forEach(function(k) {
                    if(k in this.items == false) {
                        has = false;
                    } 
                })
                return has;
            }
            return key in this.items;
        }

        get(key, maybe = null) {
            if(Array.isArray(key) == true) {
                let obj = {};
                let resolveMaybe = function(m, k, i) {
                    if(Array.isArray(m) == true) {
                        return m[i];
                    }
                    if(m instanceof Object == true) {
                        return m[k]
                    }
                    return m;
                }
                key.forEach((k, index) => obj[k] = this.get(k, resolveMaybe(maybe, key, index)))
                return obj;
            }
            return this.items[key] ?? maybe;
        }

        put(key, value = null) {
            if(key instanceof Object === false) {
                key = { [key]: value };
            }
            Object.assign(this.items, key)
            return this;
        }

        cut(key) {
            if(Array.isArray(key) == true) {
                key.forEach(k => delete this.items[k]);
            } else {
                delete this.items[key];
            }
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

        count(picker = null) {
            if(picker == null) {
                return this.size();
            }
            return this.entries.filter(picker).length;
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