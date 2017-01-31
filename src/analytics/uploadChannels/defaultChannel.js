/**
 * @class DefaultChannel
 * @classdesc Default analytics upload channel.
 * @extends Flybits.analytics.UploadChannel
 * @memberof Flybits.analytics
 */
analytics.DefaultChannel = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var ObjUtil = Flybits.util.Obj;
  var Event = analytics.Event;

  var DefaultChannel = function(opts){
    analytics.UploadChannel.call(this,opts);

    this.sessionKey = null;
    this.HOST = Flybits.cfg.analytics.channelHost;
    this.channelKey = Flybits.cfg.analytics.channelKey;
  };

  DefaultChannel.prototype = Object.create(analytics.UploadChannel.prototype);
  DefaultChannel.prototype.constructor = DefaultChannel;

  DefaultChannel.prototype.initSession = function(){
    var url = this.HOST + 'session?key='+this.channelKey;
    
  };

  DefaultChannel.prototype.uploadEvents = function(events){

  };


  return BrowserStore;
})();
