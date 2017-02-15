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
    var support = document && 'cookie' in document;
    if(support){
      try{
        BrowserUtil.setCookie('support','true');
        BrowserUtil.setCookie('support','true',new Date(0));
      } catch(e){
        support = false;
      }
    }

    return support;
  };

  CookieStore.prototype.getItem = function(key){
    return Promise.resolve(BrowserUtil.getCookie(key));
  };
  CookieStore.prototype.setItem = function(key, value){
    BrowserUtil.setCookie(key, value);
    return Promise.resolve();
  };
  CookieStore.prototype.removeItem = function(key){
    BrowserUtil.setCookie(key, '', new Date(0));
    return Promise.resolve();
  };

  return ForageStore;

})();