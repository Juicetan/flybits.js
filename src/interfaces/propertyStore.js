/**
 * Interface for implementing property stores (key-value pair storage).
 * @memberof Flybits.interface
 * @interface
 */
Flybits.interface.PropertyStore = {
  /**
   * Checks for availability of this property storage type.
   * @function
   * @memberof Flybits.interface.PropertyStore
   * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without value if this property store is supported on the current platform.
   */
  isSupported: function(){},
  /**
   * Retrieves property value based on key.
   * @function
   * @memberof Flybits.interface.PropertyStore
   * @instance
   * @param key Key by which to fetch the requested property.
   * @return {external:Promise<string,Flybits.Validation>} Promise that resolves with property store value unless a problem occurs.
   */
  getItem: function(key){},

  /**
   * Converts context value object into the server expected format.
   * @function
   * @memberof Flybits.interface.PropertyStore
   * @instance
   * @param {string} key Key by which to store provided `value`
   * @param {string} value Value that is to be stored based on provided `key`
   * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without value if value has been successfully stored based on specified key.
   */
  setItem: function(key, value){},

  /**
   * Completely remove key and value from property store.
   * @function
   * @memberof Flybits.interface.PropertyStore
   * @instance
   * @param {string} key Key by which to store provided `value`
   * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without value if key and value have been successfully removed based on specified key.
   */
  removeItem: function(key){},

};
