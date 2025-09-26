/*!
    Flyy - 1.0.0
    Author: Amine Amazou
    Description: A lightweight JavaScript library designed to simplify data management. It provides flexible structures for handling objects, lists, and collections—making it easier to organize, manipulate, and control your data with clarity and precision.
    Github Link: https://github.com/flyy.js/
    Copyright © 2024 amazou
    Licensed under the MIT license.
    https://github.com/flyy-js/blob/main/LICENSE
*/

;let Flyy = (function() {

    const errors = {
        bucket: {
            put: "You can't put new items in this bucket, It's read only.",
            cut: "You can't cut items from this bucket, It's read only.",
            take: "You can't take items from this bucket, It's read only.",
            erase: "You can't erase this bucket, It's read only.",
            touch: "You can't touch items in this bucket, It's read only."
        },
        brigade: {
            put: "You can't put a new entry in this brigade, It's read only.",
            cut: "You can't cut entries from this brigade, It's read only.",
            erase: "You can't erase this brigade, It's read only.",
            touch: "You can't touch this brigade, It's read only."
        },
        battery: {
            put: "You can't put a new bucket in this battery, It's read only.",
            cut: "You can't cut buckets from this battery, It's read only.",
            erase: "You can't erase this battery, It's read only.",
            touch: "You can't touch this battery, It's read only."
        }
    }
    /**
     * Represents a key-value store with optional read-only protection.
     * @class
     */
    class Bucket {
        
        /**
         * Creates a new Bucket.
         * @param {Object} [initial={}] - Initial items to store.
         * @param {Object} [options={ readOnly: false }] - Configuration options.
         * @param {boolean} [options.readOnly=false] - Prevents modifications if true.
         * @example
         * const b = Flyy.bucket({ name: 'Alice' });
         */
        constructor(initial = {}, options = { readOnly: false }) {
            this.items = initial;
            this.readOnly = options['readOnly'] ?? false;
        }

        /**
         * Returns all items in the bucket.
         * @returns {Object}
         * @example
         * const b = Flyy.bucket({ name: 'Alice' });
         * bucket.all(); // { name: 'Alice' }
         */
        all() {
            return this.items;
        }

         /**
         * Checks if the bucket contains a key or array of keys.
         * @param {string|string[]} key - The key(s) to check.
         * @returns {boolean}
         * @example
         * const b = Flyy.bucket({ name: 'Alice' });
         * bucket.has('name'); // true
         */
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

         /**
         * Retrieves value(s) by key(s), with optional default.
         * @param {string|string[]} key - Key(s) to retrieve.
         * @param {*} [maybe=null] - Default value if key doesn't exist.
         * @returns {*}
         * @example
         * const b = Flyy.bucket({ name: 'Alice' });
         * bucket.get('name'); // 'Alice'
         * bucket.get('age', 20); // 20
         */
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

        /**
         * Adds or updates one or more key-value pairs.
         * @param {string|Object} key - Key or object of key-values.
         * @param {*} [value=null] - Value if single key provided.
         * @returns {Bucket}
         * @example
         * const b = Flyy.bucket({ name: 'Alice' });
         * bucket.put('age', 23);
         * bucket.put({ city: 'Springfield' });
         */
        put(key, value = null) {
            if(this.readOnly === true) {
                return console.error(errors.bucket.put);
            }
            if(key instanceof Object === false) {
                key = { [key]: value };
            }
            Object.assign(this.items, key)
            return this;
        }

        /**
         * Removes one or more keys.
         * @param {string|string[]} key - Key(s) to remove.
         * @returns {Bucket}
         * @example
         * const b = Flyy.bucket({ name: 'Alice', age: 22, city: 'Springfield' });
         * bucket.cut('age');
         * bucket.cut(['name', 'city']);
         */
        cut(key) {
            if(this.readOnly === true) {
                return console.error(errors.bucket.cut);
            }
            if(Array.isArray(key) == true) {
                key.forEach(k => delete this.items[k]);
            } else {
                delete this.items[key];
            }
            return this;
        }

         /**
         * Retrieves and deletes a key.
         * @param {string} key - Key to take.
         * @returns {*} Value before deletion.
         * @example
         * const b = Flyy.bucket({ name: 'Alice' });
         * const name = bucket.take('name'); // 'Alice'
         */
        take(key) {
            if(this.readOnly === true) {
                return console.error(errors.bucket.take);
            }
            let value = this.get(key);
            this.cut(key);
            return value;
        }

         /**
         * Clears the bucket.
         * @returns {Bucket}
         * @example
         * bucket.erase(); // []
         */
        erase() {
            if(this.readOnly === true) {
                return console.error(errors.bucket.erase);
            }
            this.items = [];
            return this;
        }

        /**
         * Updates values only if they exist, otherwise adds them.
         * @param {string|Object} key - Key or object to touch.
         * @param {*} [update=null] - Value to set if single key.
         * @returns {Bucket}
         * @example
         * const b = Flyy.bucket({ name: 'Alice', age: 22, city: 'Springfield' });
         * bucket.touch('city', 'Casablanca');
         * bucket.touch({ age: 23 })
         */
        touch(key, update = null) {
            if(this.readOnly === true) {
                return console.error(errors.bucket.touch);
            }
            if(key instanceof Object === false) {
                key = { [key]: update };
            }
            Object.keys(key).forEach(k => {
                if(this.has(k)) this.items[k] = key[k];
                else this.put(k, key[k]);
            })
            return this;
        }
    
    }

    /**
     * Represents a list-like structure with optional read-only and intake transformation.
     * @class
     */
    class Brigade {

        /**
         * Creates a new Brigade.
         * @param {Array} initial - Initial entries.
         * @param {Function|null} intake - Optional transform function.
         * @param {Object} options - Configuration.
         * @param {boolean} [options.readOnly=false]
         * @param {boolean} [options.applyInTakeOnNewEntries=false]
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         */
        constructor(initial = [], intake = null, options = { readOnly: false, applyInTakeOnNewEntries: false }) {
            if(intake !== null) {
                this.entries = initial.map(intake);
            } else this.entries = initial;
            this.intake = intake;
            this.readOnly = options['readOnly'] ?? false;
            this.applyInTakeOnNewEntries = options['applyInTakeOnNewEntries'] ?? false;
        }

        /**
         * Gets all entries.
         * @returns {Array}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.all(); // [1, 2, 3]
         */
        all() {
            return this.entries;
        }

        /**
         * Gets entries by index or filter function.
         * @param {number|Function|null} picker
         * @returns {*}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.get(0); // 1
         * brigade.get(x => x > 1); // 2
         */
        get(picker = null) {
            if(isFinite(picker) == true) {
                return this.entries[picker];
            } 
            if(typeof picker == 'function') {
                return this.entries.filter(picker)
            }
            return null
        }

        /**
         * Inserts entries.
         * @param {Array|*} entries - Entries to add.
         * @param {number|null} at - Index to insert at.
         * @returns {Brigade}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.put(4); // [1, 2, 3, 4]
         * brigade.put(['a', 'b'], 1); // [1, 'a', 'b', 2, 3, 4]
         */
        put(entries = [], at = null) {
            if(this.readOnly === true) {
                return console.error(errors.put);
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

        /**
         * Removes entries.
         * @param {number|Function|Array|null} cutter - Index, range, or filter.
         * @param {number} [much=1] - How many to remove.
         * @returns {Brigade}
         * @example
         * brigade.cut(0); // removes first entry
         * brigade.cut(x => typeof x === 'string'); // removes all strings
         */
        cut(cutter = null, much = 1) {
            if(this.readOnly === true) {
                if(this instanceof Battery) console.error(errors.battery.cut);
                return console.error(errors.brigade.cut);
            }
            if(isFinite(cutter) == true) {
                this.entries.splice(cutter, much);
            } 
            if(Array.isArray(cutter) == true) {
                this.entries.splice(cutter[0], cutter[1] ?? much);
            }
            if(typeof cutter == 'function') {
                this.entries = this.entries.filter(entry => !cutter(entry))
            }
            return this;
        }

        /**
         * Clears all entries.
         * @returns {Brigade}
         * @example
         * brigade.erase(); // []
         */
        erase() {
            if(this.readOnly === true) {
                if(this instanceof Battery) console.error(errors.battery.erase);
                return console.error(errors.brigade.erase);
            }
            this.entries = [];
            return this;
        }

        /**
         * Modifies entries using a callback.
         * @param {Function} callback - Modify function.
         * @param {Function|null} picker - Filter for which entries to modify.
         * @returns {Brigade}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.touch(x => x * 2); // [2, 4, 6]
         * brigade.touch(x => x + 1, x => x === 2); // only changes 2 to 3
         */
        touch(callback = function(){}, picker = null) {
            if(this.readOnly === true) {
                if(this instanceof Battery) console.error(errors.battery.touch);
                return console.error(errors.brigade.touch);
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

        /**
         * Iterates over entries.
         * @param {Function} callback
         * @param {Function|null} picker
         * @returns {Brigade}
         * @example
         * brigade.each(console.log); // logs each item
         */
        each(callback = function(){}, picker = null) {
            if(picker == null) {
                picker = () => true;
            }
            this.get(picker).forEach(callback)
            return this;
        }

        /**
         * Removes duplicate entries.
         * @returns {Brigade}
         * @example
         * const b = Flyy.brigade([1, 1, 2, 2]);
         * b.unique(); // [1, 2]
         */
        unique() {
            this.entries = Array.from(new Set(this.entries));
            return this;
        }

        /**
         * Gets number of entries.
         * @returns {number}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.size(); // 3
         */
        size() {
            return this.entries.length;
        }

        /**
         * Gets the first entry or fallback.
         * @param {*} otherwise
         * @returns {*}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.first(); // 1
         * const emptyBrigade = Flyy.brigade([]);
         * emptyBrigade.first('none'); // 'none'
         */
        first(otherwise = function(){}) {
            if(this.size() >= 1) {
                return this.entries[0]
            }
            if(typeof otherwise == 'function') {
                return otherwise(this);
            }
            return otherwise;
        }

        /**
         * Gets first entry matching filter or fallback.
         * @param {Function} picker
         * @param {*} otherwise
         * @returns {*}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.firstOf(x => x > 2); // 3
         * brigade.firstOf(x => x > 100, 'none'); // 'none'
         */
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

        /**
         * Gets last entry or fallback.
         * @param {*} otherwise
         * @returns {*}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.last(); // 3
         * emptyBrigade.last('none'); // 'none'
         */
        last(otherwise = function(){}) {
            if(this.size() >+ 1) {
                return this.entries[this.size() - 1];
            }
            if(typeof otherwise == 'function') {
                return otherwise(this);
            }
            return otherwise;
        }

        /**
         * Gets last matching entry or fallback.
         * @param {Function} picker
         * @param {*} otherwise
         * @returns {*}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3]);
         * brigade.lastOf(x => typeof x === 'number'); // 3
         * brigade.lastOf(x => x > 100, 'none'); // 'none'
         */
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

        /**
         * Counts entries or those matching a filter.
         * @param {Function|null} picker
         * @returns {number}
         * @example
         * const brigade = Flyy.brigade([1, 2, 3, 'a', 'b', 'c']);
         * brigade.count(); // 6 (total count)
         * brigade.count(x => typeof x === 'number'); // 3 (only numbers)
         */
        count(picker = null) {
            if(picker == null) {
                return this.size();
            }
            return this.entries.filter(picker).length;
        }

    }

    /**
     * A Brigade of Buckets, with definitions applied to each Bucket.
     * @class
     * @extends Brigade
     */
    class Battery extends Brigade {

        /**
         * Creates a new Battery.
         * @param {Array<Object>} initial - Initial bucket objects.
         * @param {Object|null} definitions - Key defaults or generators.
         * @param {Object} options
         * @example
         * const battery = Flyy.battery([{ a: 1 }], { b: 2 });
         */
        constructor(initial = [], definitions = null, options = { readOnly: false, applyDefinitionsOnNewEntries: true }) {
            super([], null, options);
            this.definitions = definitions;
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
            });
            this.applyDefinitionsOnNewEntries = options['applyDefinitionsOnNewEntries'] ?? true;
        }

        /**
         * Gets raw entries or selected values from each Bucket.
         * @param {string[]|null} selector
         * @returns {Array}
         * @example
         * const battery = Flyy.battery([{ name: 'Alice', age: 22 }, { name: 'Bob', age: 30 }]);
         * battery.rawAll(['name']); // ['Alice', 'Bob']
         */
        rawAll(selector = null) {
            if(selector !== null && Array.isArray(selector)) {
                return super.all().map(bucket => bucket.get(selector))
            }
            return super.all().map(({ items }) => items);
        }

        /**
         * Inserts buckets with applied definitions.
         * @param {Object|Object[]} buckets
         * @param {number|null} at
         * @returns {Battery}
         * @example
         * const battery = Flyy.battery([], { age: 19 });
         * battery.put({ name: 'Aya' }); 
         * battery.all(); // [{ name: 'Aya', age: 19 }]
         */
        put(buckets = [], at = null) {
            if(this.readOnly === true) {
                return console.error(errors.battery.put);
            }
            if(! Array.isArray(buckets)) {
                buckets = [buckets];
            }
            if(this.applyDefinitionsOnNewEntries == true && this.definitions !== null) {
                buckets = buckets.map((bucket, index) => {
                    bucket = new Bucket(bucket);
                    Object.keys(this.definitions).forEach(definition => {
                        let value = this.definitions[definition];
                        if(typeof value == "function") {
                            bucket.put(definition, value(bucket, index));
                        } else if(bucket.has(definition) == false) {
                            bucket.put(definition, value);
                        }
                    })
                    return bucket;
                })
            }
            if(at === null) {
                this.entries.push(...buckets);
            } else {
                this.entries.splice(at, 0, ...buckets);
            }
            return this;
        }

        /**
         * Gets Buckets by match or filter.
         * @param {Object|Function|null} picker
         * @param {string[]|null} selector
         * @returns {Bucket[]|Object[]}
         * @example
         * const battery = Flyy.battery([{ x: 1 }, { x: 2 }]);
         * battery.get(bucket => bucket.x > 1); // [{ x: 2 }]
         */
        get(picker = null, selector = null) {
            let picked;
            if(picker instanceof Object) {
                picked = super.get((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                });
            } else if(typeof picker == 'function') {
                picked = super.get(picker);
            } else return null
            if(selector !== null && Array.isArray(selector)) {
                return picked.map(bucket => {
                    return bucket.get(selector);
                });
            } else return picked;
        }

        /**
         * Removes Buckets by match or index.
         * @param {Object|Function|number} picker
         * @param {number} [much=1]
         * @returns {Battery}
         * @example
         * const battery = Flyy.battery([{ id: 1 }, { id: 2 }, { id: 3 }]);
         * battery.cut(bucket => bucket.id === 2);
         * battery.all(); // [{ id: 1 }, { id: 3 }]
         */
        cut(picker = null, much = 1) {
            if(picker instanceof Object) {
                return super.cut((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                }, much);
            }
            return super.cut(picker, much);
        }

        /**
         * Updates matching Buckets.
         * @param {Object|Function} picker
         * @returns {Battery}
         * @example
         * const battery = Flyy.battery([{ count: 1 }, { count: 2 }]);
         * battery.touch(bucket => bucket.count++, bucket => bucket.count < 2);
         * battery.all(); // [{ count: 2 }, { count: 2 }]
         */
        touch(picker = null) {
            if(picker instanceof Object) {
                return super.touch((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                });
            }
            return super.touch(picker);
        }

        /**
         * Counts Buckets matching picker.
         * @param {Object|Function|null} picker
         * @returns {number}
         * @example
         * const battery = Flyy.battery([{ a: 1 }, { a: 2 }, { a: 3 }]);
         * battery.count(); // 3
         * battery.count(bucket => bucket.a > 1); // 2
         */
        count(picker = null) {
            if(picker instanceof Object) {
                return super.count((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                });
            }
            return super.count(picker);
        }

        /**
         * Gets first matching Bucket.
         * @param {Object|Function} picker
         * @param {*} otherwise
         * @returns {*}
         * @example
         * const battery = Flyy.battery([{ status: 'active' }, { status: 'archived' }]);
         * battery.firstOf(bucket => bucket.status === 'archived'); // { status: 'archived' }
         */
        firstOf(picker = function(){ return true; }, otherwise = function(){}) {
            if(picker instanceof Object) {
                return super.firstOf((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                }, otherwise);
            }
            return super.firstOf(picker, otherwise);
        }

        /**
         * Gets last matching Bucket.
         * @param {Object|Function} picker
         * @param {*} otherwise
         * @returns {*}
         * @example
         * const battery = Flyy.battery([
         *   { user: 'A', online: false },
         *   { user: 'B', online: true },
         *   { user: 'C', online: false }
         * ]);
         * battery.lastOf(bucket => !bucket.online); // { user: 'C', online: false }
         */
        lastOf(picker = function(){ return true; }, otherwise = function(){}) {
            if(picker instanceof Object) {
                return super.lastOf((bucket) => {
                    return Object.keys(picker).every((key) => bucket.get(key) === picker[key]);;
                }, otherwise);
            }
            return super.lastOf(picker, otherwise);
        }
    }

    /**
     * A helper to create Bucket, Brigade, or Battery.
     */
    class Flyy {

        /**
         * Creates appropriate structure based on initial value.
         * @param {Object|Array} initial - Initial data.
         * @param {Function|Object} intake - Intake or definitions.
         * @returns {Bucket|Brigade|Battery}
         * @example
         * const bucket = new Flyy({ name: "John" }); // `initial` is an object → returns a `Bucket`.
         * const brigade = new Flyy(["apple", "banana"]); // `initial` is an array of primitives or mixed values → returns a `Brigade`.
         * const battery = new Flyy([{ city: "Paris" }], { country: "France" }); `initial` is an array of objects → returns a `Battery`.
         */
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

        /**
         * Creates a Bucket.
         * @param {Object} initial
         * @param {Object} options
         * @returns {Bucket}
         * @example
         * const bucket = Flyy.bucket({ name: "John" });
         */
        static bucket(initial = {}, options) {
            return new Bucket(initial, options);
        }

        /**
         * Creates a Brigade.
         * @param {Array} initial
         * @param {Function} intake
         * @param {Object} options
         * @returns {Brigade}
         * @example
         * const brigade = Flyy.brigade(["apple", "banana"]);
         */
        static brigade(initial = [], intake = null, options) {
            return new Brigade(initial, intake, options);
        }

        /**
         * Creates a Battery.
         * @param {Array<Object>} initial
         * @param {Object} definitions
         * @param {Object} options
         * @returns {Battery}
         * @example
         * const battery = Flyy.battery([{ city: "Paris" }], { country: "France" });
         */
        static battery(initial = [], definitions = {}, options) {
            return new Battery(initial, definitions, options);
        }
        
    }

    return Flyy;
}());
