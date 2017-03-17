/**
 * @class DefaultChannel
 * @classdesc Default analytics upload channel.
 * @extends Flybits.analytics.UploadChannel
 * @memberof Flybits.analytics
 */
analytics.DefaultChannel = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var ApiUtil = Flybits.util.Api;
  var Session = Flybits.store.Session;
  var Event = analytics.Event;

  var DefaultChannel = function(opts){
    analytics.UploadChannel.call(this,opts);

    this.sessionKey = null;
    this.HOST = Flybits.cfg.analytics.CHANNELHOST;
    this.channelKey = Flybits.cfg.analytics.CHANNELKEY;
    this.appID = Flybits.cfg.analytics.APPID;
  };

  DefaultChannel.prototype = Object.create(analytics.UploadChannel.prototype);
  DefaultChannel.prototype.constructor = DefaultChannel;

  DefaultChannel.prototype.initSession = function(){
    var def = new Deferred();
    var channel = this;
    var url = this.HOST + '/session?key=' + this.channelKey;
    ApiUtil.fetch(url,{
      method: 'GET',
      respType: 'json'
    }).then(function(resp){
      channel.sessionKey = resp.key;
      def.resolve();
    }).catch(function(resp){
      def.reject(resp);
    });

    return def.promise;
  };

  DefaultChannel.prototype._preparePayload = function(events){
    return {
      deviceID: Session.deviceID,
      data: events.map(function(obj){
        var rawObj = obj.toJSON();
        rawObj.properties['_uid'] = Session.user.id;
        return rawObj;
      })
    };
  };

  DefaultChannel.prototype._upload = function(payload){
    var def = new Deferred();
    var url = this.HOST + '/events';
    ApiUtil.fetch(url,{
      method: 'POST',
      headers: {
        key: this.sessionKey,
        appid: this.appID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    }).then(function(resp){
      def.resolve();
    }).catch(function(resp){
      def.reject(resp);
    });

    return def.promise;
  };

  DefaultChannel.prototype.uploadEvents = function(events){
    var channel = this;
    var payload = this._preparePayload(events);
    var sessionPromise = Promise.resolve();
    if(!this.sessionKey){
      sessionPromise = this.initSession();
    }

    return sessionPromise.then(function(){
      return channel._upload(payload);
    });
  };

  return DefaultChannel;
})();
