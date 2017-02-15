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
    var support = window && window.localforage && window.localforage._driver;
    return support;
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