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

        constructor(initial = [], intake = null, options = { readOnly: false, applyInTakeOnNewEntries: false }) {
            if(intake !== null) {
                this.entries = initial.map(intake);
            } else this.entries = initial;
            this.intake = intake;
            this.readOnly = options['readOnly'] ?? false;
            this.applyInTakeOnNewEntries = options['applyInTakeOnNewEntries'] ?? false;
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

        put(entries = [], at = null) {
            if(this.readOnly === true) {
                return console.error("You can't put a new entry in this brigade, It's read only.");
            }
            if(! Array.isArray(entries)) {
                entries = [entries];
            }
            if(this.applyInTakeOnNewEntries == true && this.intake !== null) {
                entries = entries.map(this.intake);
            }
            if(at === null) {
                this.entries.push(...entries);
            } else {
                this.entries.splice(at, 0, ...entries);
            }
            return this;
        }

        cut(picker = null, much = 1) {
            if(this.readOnly === true) {
                return console.error("You can't cut entries from this brigade, It's read only.");
            }
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

        erase() {
            if(this.readOnly === true) {
                return console.error("You can't erase this brigade, It's read only.");
            }
            this.entries = [];
            return this;
        }

        touch(callback = function(){}, picker = null) {
            if(this.readOnly === true) {
                return console.error("You can't touch this brigade, It's read only.");
            }
            let mustPick = picker !== null;
            this.entries = this.entries.map(entry => {
                if(mustPick) {
                    if(picker(entry) == true) {
                        return callback(entry);
                    }
                } else {
                    return callback(entry);
                }
                return entry;
            });
            return this;
        }

        each(callback = function(){}, picker = null) {
            this.get(picker).forEach(callback)
            return this;
        }

        unique() {
            this.entries = Array.from(new Set(this.entries));
            return this;
        }

        size() {
            return this.entries.length;
        }

        first(otherwise = function(){}) {
            if(this.size() >+ 1) {
                return this.entries[0]
            }
            if(typeof otherwise == 'function') {
                return otherwise(this);
            }
            return otherwise;
        }

        firstOf(picker = function(){ return true; }, otherwise = function(){}) {
            let filtred = this.get(picker) ?? [];
            if(filtred.length >= 1) {
                return filtred[0];
            } else {
                if(typeof otherwise == 'function') {
                    return otherwise(this);
                }
                return otherwise;
            }
        }

        last(otherwise = function(){}) {
            if(this.size() >+ 1) {
                return this.entries[this.size() - 1];
            }
            if(typeof otherwise == 'function') {
                return otherwise(this);
            }
            return otherwise;
        }

        lastOf(picker = function(){ return true; }, otherwise = function(){}) {
            let filtred = this.get(picker) ?? [];
            if(filtred.length >= 1) {
                return filtred[filtred.length - 1];
            } else {
                if(typeof otherwise == 'function') {
                    return otherwise(this);
                }
                return otherwise;
            }
        }

        count(picker = null) {
            if(picker == null) {
                return this.size();
            }
            return this.entries.filter(picker).length;
        }

    }

    class Battery extends Brigade {
        constructor(initial = [], definitions = null) {
            super();
            this.entries = initial.map((ini, index) => {
                ini = new Bucket(ini);
                if(definitions !== null) {
                    Object.keys(definitions).forEach(definition => {
                        let value = definitions[definition];
                        if(typeof value == "function") {
                            ini.put(definition, value(ini, index));
                        } else if(ini.has(definition) == false) {
                            ini.put(definition, value);
                        }
                    })
                }
                return ini;
            })
        }

        count(picker = null) {
            if(picker instanceof Object) {
                return super.count((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                });
            }
            return super.count(picker);
        }
    }

    class Flyy {

        constructor(initial, intake) {
            if(Array.isArray(initial) == true) {
                if(initial.length == 1 && initial[0] instanceof Object && Object.keys(initial[0]).length == 0) {
                    return Flyy.battery([], intake);
                }
                return Flyy.brigade(initial, intake);
            } else {
                return Flyy.bucket(initial, intake);
            }
        }

        static bucket(initial = {}, intake = null) {
            return new Bucket(initial);
        }

        static brigade(initial = [], intake = null, options) {
            return new Brigade(initial, intake, options);
        }

        static battery(initial = [], definitions = {}) {
            return new Battery(initial, definitions);
        }
        
    }

    return Flyy;
}());