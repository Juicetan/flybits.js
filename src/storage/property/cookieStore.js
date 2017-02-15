var CookieStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var BrowserUtil = Flybits.util.Browser;

  var CookieStore = function(){
    BaseObj.call(this);
  };

  CookieStore.prototype = Object.create(BaseObj.prototype);
  CookieStore.prototype.constructor = CookieStore;
  CookieStore.prototype.implements('PropertyStore');

  CookieStore.prototype.isSupported = CookieStore.isSupported = function(){
    var def = new Deferred();
    var importExists = document && 'cookie' in document;
    if(importExists){
      try{
        BrowserUtil.setCookie('support','true');
        BrowserUtil.setCookie('support','true',new Date(0));
        def.resolve();
      } catch(e){
        def.reject();
      }
    } else{
      def.reject();
    }

    return def.promise;
  };

  CookieStore.prototype.getItem = function(key){
    return BrowserUtil.getCookie(key);
  };
  CookieStore.prototype.setItem = function(key, value){
    return BrowserUtil.setCookie(key, value);
  };
  CookieStore.prototype.removeItem = function(key){
    return BrowserUtil.setCookie(key, '', new Date(0));
  };

  return ForageStore;

})();