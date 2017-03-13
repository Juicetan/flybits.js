/**
 * @classdesc Abstract base class from which all Analytics upload channels are extended.
 * @memberof Flybits.analytics
 * @abstract
 * @class UploadChannel
 * @param {Object} opts Configuration object to override default configuration
 */
analytics.UploadChannel = (function(){
  var Session = Flybits.store.Session;

  var UploadChannel = function(opts){
    if(this.constructor.name === 'Object'){
      throw new Error('Abstract classes cannot be instantiated');
    }
  };
  UploadChannel.prototype = {
    implements: function(interfaceName){
      if(!this._interfaces){
        this._interfaces = [];
      }
      this._interfaces.push(interfaceName);
    },
    /**
     * Uploads a list of Events to respective destinations.
     * @abstract
     * @instance
     * @memberof Flybits.analytics.UploadChannel
     * @function uploadEvents 
     * @param {Flybits.analytics.Event[]} events Event objects to be uploaded.
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
  };

  return UploadChannel;
})();
