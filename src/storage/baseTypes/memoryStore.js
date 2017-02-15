var MemoryStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;

  var MemoryStore = function(){
    BaseObj.call(this);
    this.store = {};
  };

  MemoryStore.prototype = Object.create(BaseObj.prototype);
  MemoryStore.prototype.constructor = MemoryStore;
  MemoryStore.prototype.implements('PropertyStore');

  MemoryStore.prototype.isSupported = MemoryStore.isSupported = function(){
    return true;
  };

  MemoryStore.prototype.getItem = function(key){
    return Promise.resolve(this.store[key]);
  };
  MemoryStore.prototype.setItem = function(key, value){
    this.store[key] = value;
    return Promise.resolve();
  };
  MemoryStore.prototype.removeItem = function(key){
    delete this.store[key];
    return Promise.resolve();
  };

  return ForageStore;

})();