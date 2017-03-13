/**
 * @classdesc Base class from which all core Flybits models are extended.
 * @class
 * @param {Object} serverObj Raw Flybits core model `Object` directly from API.
 */
var BaseModel = (function(){
  var BaseModel = function(serverObj){
    BaseObj.call(this);
    /**
     * @instance
     * @memberof BaseModel
     * @member {string} id Parsed ID of the Flybits core model.
     */
    this.id;

    if(serverObj && serverObj.id){
      this.id = serverObj.id;
    }
  };

  BaseModel.prototype = Object.create(BaseObj.prototype);
  BaseModel.prototype.constructor = BaseModel;

  BaseModel.prototype.reqKeys = {
    id: 'id'
  };

  return BaseModel;
})();
