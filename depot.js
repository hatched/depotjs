'use strict';

/**
  Parse a configuration object. Used by the various methods which are able
  to create a new Collection instance.
  @param {Object} config - The Collection configuration object.
  @return {Object} The parsed configuration object.
*/
function _parseNewCollectionConfig(config) {
  if (typeof config === 'string') {
    // If the only configuration value for the collection is a
    // string then it is the collection name.
    return { name: config };
  }
  // If it's an object, pass that through.
  return config;
};

/** Class representing the Depot database. */
class Depot {
  /**
    Create a new Depot instance.
    @param {Object} config - The configuration options for the
      new Depot instance.
  */
  constructor(config) {}
  /**
    Create a new collection in the Depot instance.
    @param {Object} config - The configuration options for the new
      Collection instance.
    @return {Collection} The new instance of the Collection.
  */
  createCollection(config) {
    const parsedConfig = _parseNewCollectionConfig(config);
    const newCollection = new Collection(parsedConfig);
    this[parsedConfig.name] = newCollection;
    return newCollection;
  }
}

/** Class representing the Collection of a Depot database. */
class Collection {
  /**
    Create a new Collection instance.
    @param {Object} config - The configuration options for the new
      Collection instance.
  */
  constructor(config) {
    const parsedConfig = _parseNewCollectionConfig(config);
    /**
      The name of the Collection instance.
      @type {String}
      @readonly
    */
    this.name = parsedConfig.name;
    /**
      The internal collection of the records.
      @type {Map}
      @private
    */
    this._records = new Map();
    /**
      The internal collection of registered watcher.
      @type {Object}
      @private
    */
    this._listeners = {
      '*': new Map(),
      'add': new Map(),
      'remove': new Map(),
      'update': new Map()
    };
    /**
      Count of registered watchers.
      @type {Integer}
      @private
    */
    this._listenerCount = 0;
    /**
      Count of inserts.
      @type {Integer}
      @private
    */
    this._insertCount = 0;
  }
  /**
    Insert a new record into a collection.
    @param {Object} record - The record to insert into the collection.
    @return {Object} The inserted record.
  */
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
  /**
    Update an existing record.
    @param {Object} newRecord - The record to merge with the existing record,
      performing an update.
    @param {Object} The resulting merged object.
  */
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
  /**
    Remove an existing record.
    @param {Object} query - The query to use to find all matching records and
      remove them. Passing an id in the query object will remove only the
      record matching that id regardless of the other fields provided.
    @return {Integer} The id of the record deleted.
  */
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
  /**
    Find existing records.
    @param {Object} query - The query to use to find all matching records.
      Passing an id in the query object will remove only the record matching
      that id regardless of the other fields provided.
    @return {Object|Array} The matching records.
  */
  find(query) {
    if (query.id !== undefined) {
      // If they have provided the id then return that record
      // regardless of any other data provided in the query.
      return this._records.get(query.id);
    }
  }
  /**
    Register watchers for the *, add, remove, update events.
    @param {String} type - One of the available types: *, add, remove, update.
    @param {Function} callback - The callback to call when the event is
      triggered.
    @return {Integer} The Id of the watcher.
  */
  watch(type, callback) {
    const count = this._listenerCount;
    this._listeners[type].set(count, callback);
    this._listenerCount += 1;
    return count;
  }
}

module.exports = { Depot, Collection };
