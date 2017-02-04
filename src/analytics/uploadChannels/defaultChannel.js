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
    fetch(url,{
      method: 'GET',
      credentials: 'include'
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(resultStr){
      try {
        var resp = ApiUtil.parseResponse(resultStr);
        channel.sessionKey = resp.key;
        def.resolve();
      } catch (e) {
        def.reject(new Validation().addError("Registration Failed", "Unexpected server response.", {
          code: Validation.type.MALFORMED
        }));
      }
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        var parsedResp = ApiUtil.parseErrorMsg(resultStr);
        def.reject(new Validation().addError('Context report failed.',parsedResp,{
          serverCode: resp.status
        }));
      });
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
    fetch(url,{
      method: 'POST',
      credentials: 'include',
      headers: {
        key: this.sessionKey,
        appid: this.appID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(ApiUtil.checkResult).then(ApiUtil.getResultStr).then(function(resultStr){
      def.resolve();
    }).catch(function(resp){
      ApiUtil.getResultStr(resp).then(function(resultStr){
        var parsedResp = ApiUtil.parseErrorMsg(resultStr);
        def.reject(new Validation().addError('Analytics report failed.',parsedResp,{
          serverCode: resp.status
        }));
      });
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
