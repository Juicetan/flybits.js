/**
 * Interface for implementing data stores that operate on key/value pairs.
 * @memberof Flybits.interface
 * @interface
 */
Flybits.interface.KeyDataStore = {
  /**
   * Retrieves the amount of entries in the data store.
   * @function
   * @memberof Flybits.interface.KeyDataStore
   * @return {external:Promise<Object,Flybits.Validation>} Promise that resolves with the number of entries in the data store.
   */
  getSize: function(){},
  /**
   * Adds/Replaces/Removes an item in the data store.
   * @function
   * @memberof Flybits.interface.KeyDataStore
   * @param {string} id ID of item to be stored.
   * @param {Object} item Item to be stored in data store.  If `null` or `undefined` is supplied the related item that has provided `id` will be removed from the data store.
   * @return {external:Promise<Object,Flybits.Validation>} Promise that resolves without value if data is successfully set in data store.
   */
  set: function(id,item){},
  /**
   * Retrieves an item from the data store.
   * @function
   * @memberof Flybits.interface.KeyDataStore
   * @param {string} id ID of item to be retrieved.
   * @return {external:Promise<Object,Flybits.Validation>} Promise that resolves with data store item based on `id` if it exists.
   */
  get: function(id){},
  /**
   * Retrieves all item keys from the data store.
   * @function
   * @memberof Flybits.interface.KeyDataStore
   * @return {external:Promise<Object,Flybits.Validation>} Promise that resolves with all item keys in the data store.
   */
  getKeys: function(){},
  /**
   * Clears the entire data store of its entries.
   * @function
   * @memberof Flybits.interface.KeyDataStore
   * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without value if data clear is successful.
   */
  clear: function(){}
};
