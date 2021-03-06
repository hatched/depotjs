## Depot JS
### Small, modular, & fast JavaScript datastore.

![Depot.js logo](http://depotjs.com/images/depot.png "Depot.js")

Version: 0.1 | [Repository](https://github.com/hatched/depotjs) | [depotjs.com](http://depotjs.com)

Depot.js has three main philosophies in decending order of importance:

#### Small
Depot.js was created to fill a need where storing web application data in-memory
in a tiny package is required. There are many other in-memory databases that are
small once gzipped but the browser still has to execute the large uncompressed
version. This can become an issue on performance constrained devices. Depot.js
comes in at only 1.2K minified and only 500B gzipped.

#### Modular
The core of Depot.js has the main datastore functionalities including insert,
update, remove, find, and watch. This meets the vast majority of users needs but
for those that need more like saving to local storage, those can be added as
external plugins.

#### Fast
Even though the primary goal for Depot.js is it's small size, performance
isn't ignored. It can still perform over 1.2M op/s when being used as an in
memory object store.


### Getting Started

Creating a new database:
```JavaScript
const db = new Depot();
```

Add a collection:
```JavaScript
const kites = db.createCollection('kites');
```

Insert records:
```JavaScript
db.kites.insert({
  name: 'foo'
});
```

Find records:
```JavaScript
db.kites.find({ id: 8 });
```

Create watcher:
```JavaScript
db.kites.watch('*', record => { });
```

Get the collection size
```JavaScript
db.kites.size();
```

Register external Collection instances
```JavaScript
class Kites extends Collection {
  kite() {}
}
db.register(new Kites('kites'));
```

*Special thanks to [@huwshimi](https://twitter.com/huwshimi) for the logo!*
