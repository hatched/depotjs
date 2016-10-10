const test = require('tape');
const depotjs = require('./depot.js');

const Depot = depotjs.Depot;
const Collection = depotjs.Collection;

test('A new database can be instantiated', t => {
  const db = new Depot();
  t.equal(db instanceof Depot, true);
  t.end();
});

test('It returns a new collection instance', t => {
  const db = new Depot();
  const collection = db.createCollection('test');
  t.equal(collection instanceof Collection, true);
  t.equal(collection.name, 'test');
  t.end();
});

test('New collections are accessable on the db instance', t => {
  const db = new Depot();
  db.createCollection('test');
  t.equal(db.test instanceof Collection, true);
  t.end();
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
