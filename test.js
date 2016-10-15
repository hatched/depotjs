const test = require('tape');
const depotjs = require('./depot.js');

const Depot = depotjs.Depot;
const Collection = depotjs.Collection;

test('A new database can be instantiated', t => {
  const db = new Depot();
  t.equal(db instanceof Depot, true);
  t.end();
});

test('Depot.createCollection()', t => {

  t.test('It returns a new collection instance', t => {
    const db = new Depot();
    const collection = db.createCollection('test');
    t.equal(collection instanceof Collection, true);
    t.equal(collection.name, 'test');
    t.end();
  });

  t.test('New collections are accessable on the db instance', t => {
    const db = new Depot();
    db.createCollection('test');
    t.equal(db.test instanceof Collection, true);
    t.end();
  });

  t.test('It throws if the collection name is not supplied', t => {
    const db = new Depot();
    t.throws(
      function() { db.createCollection(); },
      'Collection requires `name` property');
    t.end();
  });

});

test('Depot.register()', t => {

  t.test('it can store external Collection classes', t => {
    const db = new Depot();
    const collection = new Collection('test');
    t.equal(db.test, undefined);
    db.register(collection);
    t.equal(db.test instanceof Collection, true);
    t.end();
  });

  t.test('it can store subclasses of a Collection', t => {
    const db = new Depot();
    class Kites extends Collection {
      kite() {
        return 'loop';
      }
    }
    db.register(new Kites('kites'));
    t.equal(db.kites instanceof Kites, true);
    t.end();
  });

  t.test('it throws if collection already exists with same name', t => {
    const db = new Depot();
    class Kites extends Collection {
      kite() {
        return 'loop';
      }
    }
    db.register(new Kites('kites'));
    t.equal(db.kites instanceof Kites, true);
    t.throws(
      function() { db.register(new Kites('kites')); },
      'Collection already exists with that name');
    t.end();
  });

});

test('Collection.insert()', t => {

  t.test('adds records to the internal store', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    t.equal(db.test._records.size, 1);
    t.end();
  });

  t.test('generates a unique record id', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    t.deepEqual(db.test._records.get(0), { _depotId: 0, id: 0, name: 'foo' });
    t.end();
  });

  t.test('allows you to specify the record id', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ id: 'suppliedid', name: 'foo' });
    t.deepEqual(db.test._records.get('suppliedid'), { _depotId: 0, id: 'suppliedid', name: 'foo' });
    t.end();
  });

  t.test('inserting increments the insert counter', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'bar' });
    t.equal(db.test._insertCount, 2);
    t.end();
  });

  t.test('auto generated id permits removing and then adding records', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'bar' });
    db.test.insert({ name: 'baz' });
    db.test.remove({ id: 1 });
    const record = db.test.insert({ name: 'bax' });
    t.equal(record.id, 3);
    t.end();
  });

  t.test('calls the "*" and "add" event handlers', t => {
    const db = new Depot();
    db.createCollection('test');
    Promise.all([
      new Promise(resolve => {
        db.test.watch('*', record => {
          t.deepEqual(record, { _depotId: 0, id: 0, name: 'foo' });
          resolve();
        });
      }),
      new Promise(resolve => {
        db.test.watch('add', record => {
          t.deepEqual(record, { _depotId: 0, id: 0, name: 'foo' });
          resolve();
        });
      })
    ]).then(() => { t.end(); });

    db.test.insert({ name: 'foo' });
  });

});

test('Collection.update()', t => {

  t.test('can update existing records', t => {
    const db = new Depot();
    db.createCollection('test');
    const record = db.test.insert({ name: 'foo' });
    record.name = 'bar';
    db.test.update(record);
    t.deepEqual(db.test.find({ id: 0 }), { _depotId: 0, id: 0, name: 'bar' });
    t.end();
  });

  t.test('calls the * and "update" event handlers', t => {
    const db = new Depot();
    db.createCollection('test');
    const record = db.test.insert({ name: 'foo' });
    Promise.all([
      new Promise(resolve => {
        db.test.watch('*', record => {
          t.deepEqual(record, { _depotId: 0, id: 0, name: 'bar' });
          resolve();
        });
      }),
      new Promise(resolve => {
        db.test.watch('update', record => {
          t.deepEqual(record, { _depotId: 0, id: 0, name: 'bar' });
          resolve();
        });
      })
    ]).then(() => { t.end(); });
    record.name = 'bar';
    db.test.update(record);
  });

});

test('Collection.find()', t => {

  t.test('returns records requested by id', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'bar' });
    db.test.insert({ name: 'baz' });
    const record = db.test.find({ id: 1 });
    t.deepEqual(record, { _depotId: 1, id: 1, name: 'bar' });
    t.end();
  });

});

test('Collection.remove()', t => {

  t.test('removes a requested record', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'bar' });
    db.test.insert({ name: 'baz' });
    t.equal(db.test.remove({ id: 1 }), true);
    // Make sure it isn't there.
    t.equal(db.test._records.get(1), undefined);
    t.end();
  });

});

test('Collection.watch', t => {

  ['*', 'add', 'remove', 'update'].forEach(type => {
    t.test(`can attach a listener for ${type} type`, t => {
      const db = new Depot();
      db.createCollection('test');
      db.test.watch(type, () => {});
      t.equal(db.test._listeners[type].size, 1);
      t.equal(typeof db.test._listeners[type].get(0), 'function');
      t.end();
    });
  });

  t.test('adding multiple listeners properly increments the counts', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.watch('add', () => {});
    db.test.watch('remove', () => {});
    db.test.watch('update', () => {});
    t.equal(db.test._listeners['add'].size, 1);
    t.equal(db.test._listeners['remove'].size, 1);
    t.equal(db.test._listeners['update'].size, 1);
    t.equal(db.test._listenerCount, 3);
    t.end();
  });

  t.test('registered "*" listener get called for add', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.watch('*', record => {
      t.deepEqual(record, { _depotId: 0, id: 0, name: 'foo' });
      t.end();
    });
    db.test.insert({ name: 'foo' });
  });

  t.test('registered "*" listener get called for remove', t => {
    const db = new Depot();
    db.createCollection('test');
    const record = db.test.insert({ name: 'foo' });
    db.test.watch('*', record => {
      t.equal(record, 0);
      t.end();
    });
    db.test.remove({ id: record.id });
  });

  t.test('registered "*" listener get called for update', t => {
    const db = new Depot();
    db.createCollection('test');
    const record = db.test.insert({ name: 'foo' });
    db.test.watch('*', record => {
      t.deepEqual(db.test.find({ id: 0 }), { _depotId: 0, id: 0, name: 'bar' });
      t.end();
    });
    record.name = 'bar';
    db.test.update(record);
  });

  t.test('registered "add" listener get called', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.watch('add', record => {
      t.deepEqual(record, { _depotId: 0, id: 0, name: 'foo' });
      t.end();
    });
    db.test.insert({ name: 'foo' });
  });

  t.test('registered "remove" listener get called', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.watch('remove', id => {
      t.deepEqual(id, 0);
      t.end();
    });
    const record = db.test.insert({ name: 'foo' });
    db.test.remove({ id: record.id });
  });

});

test('Collection.size()', t => {

  t.test('can return the number of records in the collection', t => {
    const db = new Depot();
    db.createCollection('test');
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'foo' });
    t.equal(db.test.size(), 3);
    db.test.remove({ id: 0 });
    t.equal(db.test.size(), 2);
    db.test.insert({ name: 'foo' });
    db.test.insert({ name: 'foo' });
    t.equal(db.test.size(), 4);
    t.end();
  });

});
