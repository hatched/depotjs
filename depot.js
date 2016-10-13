'use strict';

function _parseNewCollectionConfig(config) {
  if (typeof config === 'string') {
    // If the only configuration value for the collection is a
    // string then it is the collection name.
    return { name: config };
  }
  // If it's an object, pass that through.
  return config;
};

class Depot {
  constructor(config) {}
  createCollection(config) {
    const parsedConfig = _parseNewCollectionConfig(config);
    const newCollection = new Collection(parsedConfig);
    this[parsedConfig.name] = newCollection;
    return newCollection;
  }
}

class Collection {
  constructor(config) {
    const parsedConfig = _parseNewCollectionConfig(config);
    this.name = parsedConfig.name;
    this._records = new Map();
    this._listeners = {
      '*': new Map(),
      'add': new Map(),
      'remove': new Map(),
      'update': new Map()
    };
    this._listenerCount = 0;
    this._insertCount = 0;
  }
  insert(record) {
    record._depotId = this._insertCount;
    if (!record.id) {
      record.id = this._insertCount;
    }
    this._insertCount += 1;
    this._records.set(record.id, record);
    this._listeners['*'].forEach((val, key, map) => {
      val(record);
    });
    this._listeners.add.forEach((val, key, map) => {
      val(record);
    });
    return record;
  }
  update(newRecord) {
    const depotId = newRecord._depotId;
    const mergedRecord = Object.assign(
      this._records.get(depotId), newRecord);
    this._records.set(depotId, mergedRecord);
    this._listeners['*'].forEach((val, key, map) => {
      val(mergedRecord);
    });
    this._listeners.update.forEach((val, key, map) => {
      val(mergedRecord);
    });
    return mergedRecord;
  }
  remove(query) {
    if (query.id !== undefined) {
      // If they have provided the id then delete that record
      // regardless of any other data provided in the query.
      this._listeners['*'].forEach((val, key, map) => {
        val(query.id);
      });
      this._listeners.remove.forEach((val, key, map) => {
        val(query.id);
      });
      return this._records.delete(query.id);
    }
  }
  find(query) {
    if (query.id !== undefined) {
      // If they have provided the id then return that record
      // regardless of any other data provided in the query.
      return this._records.get(query.id);
    }
  }
  watch(type, callback) {
    const count = this._listenerCount;
    this._listeners[type].set(count, callback);
    this._listenerCount += 1;
    return count;
  }
}

module.exports = { Depot, Collection };
