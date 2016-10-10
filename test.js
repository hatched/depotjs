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
