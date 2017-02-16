var LocalStorageStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;

  var LocalStorageStore = function(){
    BaseObj.call(this);
    this.store = localStorage;
  };

  LocalStorageStore.prototype = Object.create(BaseObj.prototype);
  LocalStorageStore.prototype.constructor = LocalStorageStore;
  LocalStorageStore.prototype.implements('PropertyStore');

  LocalStorageStore.prototype.isSupported = LocalStorageStore.isSupported = function(){
    var def = new Deferred();
    var validation = new Validation();
    var support = window && window.localStorage;
    if(support){
      try {
        localStorage.setItem('support', true);
        localStorage.removeItem('support');
        def.resolve()
      } catch (e) {
        def.reject(validation.addError('Storage not supported','Access error:' + e,{
          context: 'localStorage'
        }));
      }
    } else{
      def.reject(validation.addError('Storage not supported','Missing reference in namespace.',{
        context: 'localStorage'
      }));
    }

    return def.promise;
  };

  LocalStorageStore.prototype.getItem = function(key){
    return Promise.resolve(this.store.getItem(key));
  };
  LocalStorageStore.prototype.setItem = function(key, value){
    this.store.setItem(key, value);
    return Promise.resolve();
  };
  LocalStorageStore.prototype.removeItem = function(key){
    this.store.removeItem(key);
    return Promise.resolve();
  };

  return LocalStorageStore;

})();