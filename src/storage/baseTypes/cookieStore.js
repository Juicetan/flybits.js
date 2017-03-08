var CookieStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var BrowserUtil = Flybits.util.Browser;

  function CookieStore(){
    BaseObj.call(this);
  };

  CookieStore.prototype = Object.create(BaseObj.prototype);
  CookieStore.prototype.constructor = CookieStore;
  CookieStore.prototype.implements('PropertyStore');

  CookieStore.prototype.isSupported = CookieStore.isSupported = function(){
    var def = new Deferred();
    var validation = new Validation();
    var support = document && 'cookie' in document;
    if(support){
      try{
        BrowserUtil.setCookie('flbstoresupport','true');
        BrowserUtil.setCookie('flbstoresupport','true',new Date(0));
        def.resolve();
      } catch(e){
        def.reject(validation.addError('Storage not supported','Access error:' + e,{
          context: 'cookie'
        }));
      }
    } else{
      def.reject(validation.addError('Storage not supported','Missing reference in namespace.',{
        context: 'cookie'
      }));
    }

    return def.promise;
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

  return CookieStore;

})();