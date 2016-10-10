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

function _generateId(records) {
  return records.length + '';
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
    this._records = [];
  }
  insert(record) {
    if (!record.id) {
      record.id = _generateId(this._records);
    }
    this._records.push(record);
  }
  remove() {}
  find() {}
}

module.exports = { Depot, Collection };
