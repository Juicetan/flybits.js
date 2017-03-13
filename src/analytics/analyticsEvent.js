/**
 * @classdesc Model to represent an analytics event to be logged.
 * @class Event
 * @memberof Flybits.analytics
 * @extends BaseModel
 * @implements {Flybits.interface.Serializable}
 * @param {Object} serverObj Raw Flybits core model `Object` directly from API.
 */
analytics.Event = (function(){
  var ObjUtil = Flybits.util.Obj;

  var Event = function(serverObj){
    BaseModel.call(this,serverObj);
    this._tmpID = ObjUtil.guid(1) + '-' + Date.now();
    this.type = this.types.DISCRETE;
    this.name = '';
    this.loggedAt = new Date();
    this.properties = {};
    this._internal = {};
    this._isInternal = false;

    if(serverObj){
      this.fromJSON(serverObj);
    }
  };
  Event.prototype = Object.create(BaseModel.prototype);
  Event.prototype.constructor = Event;
  Event.prototype.implements('Serializable');

  /**
   * @memberof Flybits.analytics.Event
   * @member {Object} types A mapping of event types.
   * @constant
   * @property {string} DISCRETE Event type for discrete one time events.
   * @property {string} TIMEDSTART Event type for the start of a timed event.
   * @property {string} TIMEDEND Event type for the end of a timed event.
   */
  Event.prototype.types = Event.types = {};
  Event.prototype.types.DISCRETE = Event.types.DISCRETE = 'event_discrete';
  Event.prototype.types.TIMEDSTART = Event.types.TIMEDSTART = 'event_timestart';
  Event.prototype.types.TIMEDEND = Event.types.TIMEDEND = 'event_timeend';

  Event.prototype.TIMEDREFID = Event.TIMEDREFID = 'timedRef';
  Event.prototype.OSTYPE = Event.OSTYPE = 'osType';
  Event.prototype.OSVERSION = Event.OSVERSION = 'osVersion';

  Event.prototype._setProp = function(obj, key, value){
    if(typeof value === 'undefined' || value === null){
      delete obj[key];
      return this;
    }

    obj[key] = value;
    return this;
  };

  /**
   * Used to set custom properties on to an analytics event.
   * @function setProperty
   * @instance
   * @memberof Flybits.analytics.Event
   * @param {string} key Data key.
   * @param {Object} value Any valid JSON value to be stored based on provided key.  If `null` or `undefined` is provided then the provided key will be removed from the properties map.
   */
  Event.prototype.setProperty = function(key, value){
    return this._setProp(this.properties, key, value);
  };

  Event.prototype._setInternalProperty = function(key, value){
    return this._setProp(this._internal, key, value);
  };

  Event.prototype.fromJSON = function(serverObj){
    /**
     * @instance
     * @memberof Flybits.analytics.Event
     * @member {string} type Event type.
     */
    this.type = serverObj.type || this.types.DISCRETE;
    /**
     * @instance
     * @memberof Flybits.analytics.Event
     * @member {string} name Name of event.
     */
    this.name = serverObj.name;
    /**
     * @instance
     * @memberof Flybits.analytics.Event
     * @member {Date} loggedAt Date object instantiated at time of logging.
     */
    this.loggedAt = serverObj.loggedAt?new Date(serverObj.loggedAt):new Date();
    /**
     * @instance
     * @memberof Flybits.analytics.Event
     * @member {Object} properties Custom event properties.
     */
    this.properties = serverObj.properties || {};

    this._internal = serverObj.flbProperties || {};
    this._isInternal = serverObj.isFlybits || false;
  };

  Event.prototype.toJSON = function(){
    var obj = this;
    var retObj = {
      type: this.type,
      name: this.name,
      loggedAt: this.loggedAt.getTime(),
      properties: this.properties,
      flbProperties: this._internal,
      isFlybits: this._isInternal
    };

    return retObj;
  };

  return Event;
})();
