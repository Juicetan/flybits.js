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
    var validation = new Validation();
    var support = window && window.localforage;
    if(support){
      localforage.setItem('flbstoresupport',true).then(function(){
        return localforage.removeItem('flbstoresupport');
      }).then(function(){
        def.resolve();
      }).catch(function(e){
        def.reject(validation.addError('Storage not supported','Access error:' + e,{
          context: 'localforage'
        }));
      });
    } else{
      def.reject(validation.addError('Storage not supported','No library detected',{
        context: 'localforage'
      }));
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