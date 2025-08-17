<h1> Flyy.js </h1>

**A lightweight JavaScript library designed to simplify data management.**

Flyy provides flexible structures for handling objects, lists, and collections—making it easier to organize, manipulate, and control your data with clarity and precision. It's simple, intuitive, and has no dependencies.

---

## Table of Contents
  
  - [Core Concepts](#core-concepts)
  - [Installation](#installation)
  - [API Documentation](#api-documentation)
    - [The `Flyy` Helper](#the-flyy-helper)
    - [`Flyy.bucket`](#flyy-bucket)
    - [`Flyy.brigade`](#flyy-brigade)
    - [`Flyy.battery`](#flyy-battery)
  - [Tips and Tricks](#tips-and-tricks)
  - [Credits](#credits)
  - [License](#license)

---

## Core Concepts

Flyy.js is built around three code data structures:

- **Bucket**: Think of a `Bucket` as a super-powered JavaScript `Object`. It's a key-value store designed for easy and safe manipulation of single records, like user settings or configuration data.
- **Brigade**: A `Brigade` is like an enhanced `Array`. It's perfect for managing lists of items, such as tags, tasks, or simple logs. It comes with powerful filtering, manipulation, and querying methods.
- **Battery**: A `Battery` is a collection of `Buckets` (an array of objects). It's the ideal tool for managing datasets, like a list of users, products in a cart, or posts from an API. It combines the power of a `Brigade` with the structure of `Buckets`.

---

## Installation

You can use Flyy.js by including it directly in your HTML file.

```html
<script src="https://cdn.jsdelivr.net/gh/flyy-js/flyy@latest/dist/flyy.js"></script>
```

Or, download the flyy.js file from the GitHub repository and include it locally.

```html
<script src="path/to/flyy.js"></script>
```

---

## API Documentation

### **The `Flyy` Helper**

The main `Flyy` constructor is a smart helper that automatically creates the correct data structure based on the input you provide.

- `new Flyy({ key: 'value' })` → creates a `Bucket`.
- `new Flyy(['item1', 'item2'])` → creates a `Brigade`.
- `new Flyy([{ id: 1 }, { id: 2 }])` → creates a `Battery`.

You can also create instances directly using the static methods:

- `Flyy.bucket(initial, options)`: Creates a `Bucket`.
- `Flyy.brigade(initial, intake, options)`: Creates a `Brigade`.
- `Flyy.battery(initial, definitions, options)`: Creates a `Battery`.

**Examples:**

```javascript
// Using the smart constructor
const userSettings = new Flyy({ theme: 'dark', notifications: true }); // Creates a Bucket

// Using a static method
const tasks = Flyy.brigade(['Buy milk', 'Walk the dog']); // Creates a Brigade
```

---

### **`Flyy.bucket` - The Key-Value Store** 

A `Bucket` is a flexible object wrapper for managing key-value data.

`constructor(initial = {}, options = { readOnly: false })`

Creates a new `Bucket` instance.

- `initial`: An object with the initial key-value pairs.
- `options.readOnly`: If `true`, prevents any modifications to the bucket.

```javascript
const user = Flyy.bucket({ name: 'Aya', age: 19 });
const config = Flyy.bucket({ version: '1.0' }, { readOnly: true });
```

**`.all()`**

Returns the entire object of items.

```javascript
console.log(user.all()); // Output: { name: 'Aya', age: 19 }
```

**`.has(key | keyArray)`**

Checks if one or more keys exist in the bucket.

```javascript
user.has('name'); // true
user.has(['name', 'email']); // false (email does not exist)
```

**`.get(key | keyArray, maybe = null)`**

Retrieves a value for a given key. If the key doesn't exist, it returns the `maybe` default value. Can also retrieve multiple keys into a new object.

```javascript
user.get('age'); // 30
user.get('email', 'no-email@example.com'); // 'no-email@example.com'

// Get multiple keys
user.put('city', 'Casablanca');
const profile = user.get(['name', 'city']);
console.log(profile); // { name: 'Aya', city: 'Casablanca' }
```

**`.put(key, value) | .put({ key: value, ... })`**

Adds or updates one or more key-value pairs.

```javascript
// Add a single item
user.put('isVerified', true);

// Add multiple items
user.put({ country: 'Morocco', status: 'active' });

console.log(user.all()); // { name: 'Aya', age: 19, isVerified: true, country: 'Morocco', status: 'active' }
```

**`.cut(key | keyArray)`**

Removes one or more items from the bucket by their key.

```javascript
user.cut('isVerified'); // Removes the isVerified key
user.cut(['country', 'status']); // Removes both keys
```

**`.take(key)`**

Retrieves the value for a key and then removes that key from the bucket.

```javascript
const userAge = user.take('age');
console.log(userAge); // 30
console.log(user.has('age')); // false
```

**`.erase()`**

Clears all items from the bucket.

```javascript
user.erase();
console.log(user.all()); // {}
```

**`.touch(key, value) | .touch({ key: value, ... })`**

Updates the value of an **existing** key. If the key doesn't exist, it adds it. This is useful for ensuring you only modify keys you expect to be there.

```javascript
const product = Flyy.bucket({ name: 'Laptop', stock: 10 });

// Update existing stock
product.touch('stock', 9);

// Add a new property
product.touch('price', 1200);

console.log(product.all()); // { name: 'Laptop', stock: 9, price: 1200 }
```

---

### **`Flyy.brigade` - The Enhanced List**

A `Brigade` is designed to manage arrays of data with powerful helper methods.

`constructor(initial = [], intake = null, options = {})`

Creates a new `Brigade` instance.

- `initial`: The starting array.
- `intake`: A function to transform every item as it's added to the brigade.
- `options.readOnly`: If `true`, prevents modification.
- `options.applyInTakeOnNewEntries`: If `true`, the `intake` function will also apply to items added later with `.put()`.

```javascript
// A simple brigade of numbers
const scores = Flyy.brigade([10, 25, 40]);

// A brigade that converts all new strings to uppercase
const tags = Flyy.brigade(['react', 'js'], (tag) => tag.toUpperCase(), { applyInTakeOnNewEntries: true });
console.log(tags.all()); // ['REACT', 'JS']
```

**`.all()`**

Returns the entire array of entries.

```javascript
console.log(scores.all()); // [10, 25, 40]
```

**`.get(picker)`**

Retrieves entries. If `picker` is a number, it gets the item at that index. If `picker` is a function, it filters the entries.

```javascript
scores.get(1); // 25
scores.get(score => score > 20); // [25, 40]
```

**`.put(entries, at = null)`**

Adds one or more entries. By default, it adds to the end. Use the `at` index to insert them elsewhere.

```javascript
scores.put(50); // [10, 25, 40, 50]
scores.put([15, 20], 1); // [10, 15, 20, 25, 40, 50]

tags.put('vue'); // The intake function runs: ['REACT', 'JS', 'VUE']
```

**`.cut(picker, much = 1)`**

Removes entries.

- **Number picker**: `cut(index, howMany)` - Removes items starting from an index.

- **Function picker**: `cut(filterFunction)` - Removes all items that do not match the filter (it keeps matching items).

```javascript
const items = Flyy.brigade(['a', 'b', 'c', 'd']);
items.cut(1, 2); // Removes 'b' and 'c' -> ['a', 'd']

const numbers = Flyy.brigade([1, 2, 3, 4, 5]);
// Keep only even numbers
numbers.cut(num => num % 2 === 0);
console.log(numbers.all()); // [2, 4]
```

`.erase()`

Clears all entries from the brigade.

```javascript
scores.erase(); // []
```

**`.touch(callback, picker = null))`**

Modifies entries in place. The `callback` function defines the modification. If a `picker` function is provided, it only touches the entries that match the filter.

```javascript
const prices = Flyy.brigade([10, 20, 30, 40]);

// Double all prices
prices.touch(price => price * 2); // [20, 40, 60, 80]

// Add a 10% discount only to prices over 50
prices.touch(price => price * 0.9, price => price > 50); // [20, 40, 54, 72]
```

**`.each(callback, picker = null)`**

Iterates over entries, similar to `Array.forEach()`.

```javascript
prices.each(price => console.log(Price is: $${price}));

// Log only the discounted prices
prices.each(price => console.log(Discounted: $${price}), price => price < 60);
```

**`.unique()`**

Removes duplicate entries.

```javascript
const duplicates = Flyy.brigade([1, 2, 2, 3, 1, 4]);
duplicates.unique();
console.log(duplicates.all()); // [1, 2, 3, 4]
```

**`.size()` & `.count(picker = null)`**

`size()` returns the total number of entries. `count()` returns the total number or the count of entries matching a filter.

```javascript
prices.size(); // 4
prices.count(price => price > 50); // 2
```

**`.first(otherwise)` & `.last(otherwise)`**

Gets the first or last entry. If the brigade is empty, it returns the `otherwise` value.

```javascript
prices.first(); // 20
prices.last(); // 72

Flyy.brigade().first('empty'); // 'empty'
```

**`.firstOf(picker, otherwise)` & `.lastOf(picker, otherwise)`**

Gets the first or last entry that matches the `picker` function.

```javascript
prices.firstOf(price => price > 30); // 40
prices.lastOf(price => price > 30); // 72
```

---

### **`Flyy.battery` - The Collection of Buckets** 

A `Battery` manages an array of objects (`Buckets`), making it perfect for handling structured data collections. It inherits all the methods from `Brigade` (`.get`, `.cut`, `.touch`, etc.) but supercharges them to work with objects.

`constructor(initial = [], definitions = null, options = {})`

Creates a new `Battery` instance.

- `initial`: An array of objects. Each object becomes a `Bucket`.
- `definitions`: An object that defines default or computed properties for every bucket in the battery.
- `options.applyDefinitionsOnNewEntries:`: If `true` (default), applies definitions to new buckets added with `.put()`.

**Use Case: Managing a list of products.**

```javascript
const products = Flyy.battery(
    [
        { id: 1, name: 'Laptop', price: 1200, stock: 15 },
        { id: 2, name: 'Mouse', price: 25, stock: 0 }
    ],
    {
        // Add a default 'currency' if not present
        currency: 'USD',
        // Add a computed 'status' property based on stock
        status: (bucket) => (bucket.get('stock') > 0 ? 'In Stock' : 'Out of Stock')
    }
);
```

**`.all()`**

Returns an array of Bucket instances.

```javascript
const allProducts = products.all();
console.log(allProducts[0].get('status')); // 'In Stock'
console.log(allProducts[1].get('status')); // 'Out of Stock'
```

**`.rawAll(selector = null)`**

Returns an array of plain JavaScript objects instead of `Bucket` instances.

- `selector`: An array of keys to pick from each object.

```javascript
// Get all data as plain objects
console.log(products.rawAll());
/* Output:
[
  { id: 1, name: 'Laptop', price: 1200, stock: 15, currency: 'USD', status: 'In Stock' },
  { id: 2, name: 'Mouse', price: 25, stock: 0, currency: 'USD', status: 'Out of Stock' }
]
*/

// Get only the names and prices
console.log(products.rawAll(['name', 'price']));
/* Output:
[
  { name: 'Laptop', price: 1200 },
  { name: 'Mouse', price: 25 }
]
*/
```

**`.get(picker, selector = null)`**

Retrieves buckets. The `picker` can be a filter function or a "query-by-example" object.

```javascript
// Get using a filter function
const expensiveProducts = products.get(p => p.get('price') > 1000);

// Get using a query object
const mouse = products.get({ name: 'Mouse' });

// Get just the names of products that are in stock
const availableProductNames = products.get({ status: 'In Stock' }, ['name']);
console.log(availableProductNames); // [{ name: 'Laptop' }]
```

**`.put(buckets, at = null)`**

Adds one or more new buckets. The `definitions` from the constructor will be automatically applied.

```javascript
products.put({ id: 3, name: 'Keyboard', price: 75, stock: 30 });
// The new product will automatically get currency: 'USD' and status: 'In Stock'
```

**`.cut(picker)`**

Removes buckets matching a filter function or a query object.

```javascript
// Remove out of stock products
products.cut({ status: 'Out of Stock' });
```

**`.touch(callback, picker)`**

Modifies buckets matching a picker.

```javascript
// Apply a 10% discount to all laptops
products.touch(
    (product) => product.put('price', product.get('price') * 0.9), // The update
    { name: 'Laptop' } // The picker
);
```

---

## Tips and Tricks

**1. Method Chaining**

Most methods in Flyy return the instance (`this`), allowing you to chain operations together for clean, readable code.

```javascript
const tasks = Flyy.brigade(['Task 1', 'Task 3']);

tasks
    .put('Task 2', 1) // Add Task 2 at the correct position
    .cut(0) // Remove the first task
    .touch(task => [COMPLETED] ${task}, task => task === 'Task 3') // Mark a task as completed
    .put('Task 4'); // Add a new task

console.log(tasks.all()); // ['Task 2', '[COMPLETED] Task 3', 'Task 4']
```

**2. Read-Only Data**

Use the `{ readOnly: true }` option to create immutable data structures. This is great for managing state where you want to prevent accidental modifications.

```javascript
const appConfig = Flyy.bucket({ version: '1.0.0', api_url: '/api' }, { readOnly: true });

appConfig.put('version', '1.1.0'); // Logs an error: "You can't put new items in this bucket, It's read only."
```

**3. Powerful intake and definitions**

- Brigade `intake`: Use `intake` to automatically process data as it enters a `Brigade`. You can sanitize strings, create class instances, or format values.

    ```javascript
    class User {
        constructor(name) { this.name = name; }
    }
    // This brigade will automatically convert name strings into User objects
    const userList = Flyy.brigade(['Alice', 'Bob'], name => new User(name));
    ```

- Battery `definitions`: Use `definitions` to enforce a data schema, add default values, and create computed properties that are always in sync.

    ```javascript
    const cart = Flyy.battery(
    [{ name: 'Book', price: 15, quantity: 2 }],
    {
        // Add a computed total for each item
        total: (item) => item.get('price') * item.get('quantity')
    });
    console.log(cart.first().get('total')); // 30
    ```

--- 

## Credits

- Created and maintained with passion by [Amine Amazou](https://github.com/amine-amazou).
- JSDoc generated by [ChatGPT](chatgpt.com).
- Documentation generated by [Gemini](gemini.google.com).

---

## License

Flyy.js is licensed under the **MIT License**

Copyright © 2025 amazou.