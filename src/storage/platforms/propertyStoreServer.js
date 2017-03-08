Flybits.store.Property.server = (function(){
  var Deferred = Flybits.Deferred;
  var _ready = new Deferred();
  var storage;

  var Property = {
    ready: _ready.promise,
    init: function(){
      storage = Persistence.create({
        dir: Flybits.cfg.store.RESOURCEPATH
      });
      storage.initSync();
      _ready.resolve();
    },
    remove: function(key){
      var def = new Deferred();
      var store = this;

      storage.removeItem(key).then(function(){
        def.resolve(store);
      }).catch(function(e){
        def.reject(e);
      });

      return def.promise;
    },
    set: function(key,value){
      var def = new Deferred();
      var store = this;
      if(!value){
        return this.remove(key);
      } else{
        storage.setItem(key,value).then(function(){
          def.resolve(store);
        }).catch(function(e){
          def.reject(e)
        });
      }
      return def.promise;
    },
    get: function(key){
      var def = new Deferred();

      storage.getItem(key).then(function(val){
        def.resolve(val);
      }).catch(function(e){
        def.reject(e)
      });

      return def.promise;
    }
  };

  return Property;
})();
