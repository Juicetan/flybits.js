/**
 * @classdesc Abstract base class from which all Analytics stores are extended.
 * @memberof Flybits.analytics
 * @abstract
 * @class AnalyticsStore
 * @param {Object} opts Configuration object to override default configuration
 * @param {number} opts.maxStoreSize {@link Flybits.analytics.AnalyticsStore#maxStoreSize}
 */
analytics.AnalyticsStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;

  var AnalyticsStore = function(opts){
    if(this.constructor.name === 'Object'){
      throw new Error('Abstract classes cannot be instantiated');
    }

    /**
     * @instance
     * @memberof Flybits.analytics.AnalyticsStore
     * @member {number} [maxStoreSize=100] Maximum amount of analytics events to store locally before old events are flushed from the local store.
     */
    this.maxStoreSize = opts && opts.maxStoreSize?opts.maxStoreSize:100;
  };
  AnalyticsStore.prototype = {
    implements: function(interfaceName){
      if(!this._interfaces){
        this._interfaces = [];
      }
      this._interfaces.push(interfaceName);
    },
    /**
     * Add an analytics event to the local persistent storage.
     * @abstract
     * @instance
     * @memberof Flybits.analytics.AnalyticsStore
     * @function addEvent 
     * @param {Flybits.analytics.Event} event Event object to be logged.
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
    /**
     * Removes analytics events from local persistent store based on their IDs.
     * @abstract
     * @instance
     * @memberof Flybits.analytics.AnalyticsStore
     * @function clearEvents
     * @param {string[]} eventIDs Generated temporary IDs of analytics events stored locally.
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */ 
    /**
     * Removes all analytics events from local persistent store.
     * @abstract
     * @instance
     * @memberof Flybits.analytics.AnalyticsStore
     * @function clearAllEvents
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */ 
    /**
     * Retrieves all analytics events from local persistent storage that is currently available.
     * @abstract
     * @instance
     * @memberof Flybits.analytics.AnalyticsStore
     * @function getEvents
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves with all analytics events currently persisted and rejects with a common Flybits Validation model instance.
     */ 
  };

  return AnalyticsStore;
})();
