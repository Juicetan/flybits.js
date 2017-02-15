Flybits.store.Property.browser = (function(){
  var Deferred = Flybits.Deferred;

  var availableStorage = [ForageStore,LocalStorageStore,CookieStore,MemoryStore];
  var getStorageEngine = function(){
    for(var i = 0; i < availableStorage.length; i++){
      var CurEngine = availableStorage[i];
      if(CurEngine.isSupported()){
        return new CurEngine(Flybits.cfg.store.SDKPROPS);
      }
    }
  };

  var Property = {
    init: function(){
      this.storageEngine = getStorageEngine();
    },
    remove: function(key){
      return this.storageEngine.removeItem(key);
    },
    set: function(key, value){
      if(!value){
        return this.remove(key);
      }
      return this.storageEngine.setItem(key, value);
    },
    get: function(key){
      return this.storageEngine.getItem(key);
    }
  };

  return Property;
})();
