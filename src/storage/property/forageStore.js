var ForageStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;

  var ForageStore = function(storeName){
    BaseObj.call(this);
    this.store = localforage.createInstance({
      name: storeName
    });
  };

  ForageStore.prototype = Object.create(BaseObj.prototype);
  ForageStore.prototype.constructor = ForageStore;
  ForageStore.prototype.implements('PropertyStore');

  ForageStore.prototype.isSupported = ForageStore.isSupported = function(){
    var def = new Deferred();
    var importExists = window && window.localforage && window.localforage._driver;
    if(importExists){
      localforage.setItem('support',true).then(function(){
        return localforage.removeItem('support');
      }).then(function(){
        def.resolve();
      }).catch(function(e){
        def.reject();
      });
    } else{
      def.reject();
      return def.promise;
    }

    return def.promise;
  };

  ForageStore.prototype.getItem = function(key){
    return this.store.getItem(key);
  };
  ForageStore.prototype.setItem = function(key, value){
    return this.store.setItem(key, value);
  };
  ForageStore.prototype.removeItem = function(key){
    return this.store.removeItem(key);
  };

  return ForageStore;

})();