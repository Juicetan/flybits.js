Flybits.store.Property.browser = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var _ready = new Deferred();

  var resolveStorageEngine = function(){
    var def = new Deferred();
    var availableStorage = [ForageStore,LocalStorageStore,CookieStore,MemoryStore];
    var checkStorageEngine = function(){
      if(availableStorage.length < 1){
        def.reject(new Validation().addError('No supported property storage engines'))
      }
      var CurEngine = availableStorage.shift();
      CurEngine.isSupported().then(function(){
        def.resolve(new CurEngine(Flybits.cfg.store.SDKPROPS));
      }).catch(function(){
        checkStorageEngine();
      });
    };
    checkStorageEngine();

    return def.promise;
  };

  var Property = {
    ready: _ready.promise,
    init: function(){
      var property = this;
      var engineInit = resolveStorageEngine();
      engineInit.then(function(engine){
        property.storageEngine = engine;
        _ready.resolve();
      });
      return engineInit;
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
