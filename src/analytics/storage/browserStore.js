/**
 * @class BrowserStore
 * @classdesc Default analytics store for browsers.
 * @extends Flybits.analytics.AnalyticsStore
 * @memberof Flybits.analytics
 */
analytics.BrowserStore = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var ObjUtil = Flybits.util.Obj;
  var Event = analytics.Event;

  function BrowserStore(opts){
    analytics.AnalyticsStore.call(this,opts);
    if(opts){
      this.opts = ObjUtil.extend({},this.opts);
      ObjUtil.extend(this.opts,opts);
    }

    if(window.localforage){
      this._store = localforage.createInstance({
        name: this.STOREID
      });
    } else {
      console.error('> WARNING ('+this.STOREID+'): `localforage` dependency not found. Reverting to temporary in memory storage.')
      this._store = {
        contents: {},
        keys: function(){
          return Promise.resolve(Object.keys(this.contents));
        },
        removeItem: function(key){
          delete this.contents[key];
          return Promise.resolve();
        },
        setItem: function(key,item){
          this.contents[key] = item;
          return Promise.resolve(item);
        },
        getItem: function(key){
          var result = this.contents[key]?this.contents[key]:null;
          return Promise.resolve(result);
        },
        length: function(){
          return Promise.resolve(Object.keys(this.contents).length);
        },
        iterate: function(callback){
          var keys = Object.keys(this.contents);
          for(var i = 0; i < keys.length; i++){
            callback(this.contents[keys[i]],keys[i],i);
          }
          return Promise.resolve();
        },
        clear: function(){
          this.contents = {};
          return Promise.resolve();
        }
      }
    }
  }

  BrowserStore.prototype = Object.create(analytics.AnalyticsStore.prototype);
  BrowserStore.prototype.constructor = BrowserStore;

  /**
   * @memberof Flybits.analytics.BrowserStore
   * @member {string} STOREID String key for local storage
   */
  BrowserStore.prototype.STOREID = BrowserStore.STOREID = 'flb.analytics';

  BrowserStore.prototype.addEvent = function(event){
    var def = new Deferred();
    var bStore = this;
    var store = this._store;
    var storeLength = 0;

    if(!(event instanceof Event)){
      def.reject(new Validation().addError('Invalid Argument','Must be an instance of an analytics Event',{
        code: Validation.type.INVALIDARG
      }));
      return def.promise;
    }

    store.length().then(function(length){
      storeLength = length;
      return bStore._saveState(event);
    }).then(function(){
      if (storeLength >= bStore.maxStoreSize){
        plugin._validateStoreState().then(function(){
          def.resolve();
        });
      } else{
        def.resolve();
      }
    }).catch(function(e){
      def.reject(e);
    });

    return def.promise;
  };

  BrowserStore.prototype.getEvent = function(tmpID){
    var def = new Deferred();
    this._store.getItem(tmpID).then(function(res){
      if(res){
        var rehydratedEvt = new Event(res);
        rehydratedEvt._tmpID = tmpID;
        def.resolve(rehydratedEvt);
      } else{
        def.resolve();
      }
    }).catch(function(e){
      def.reject(e);
    });

    return def.promise;
  };

  BrowserStore.prototype.clearEvents = function(tmpIDs){
    var store = this._store;
    var def = new Deferred();
    var deleteData;
    deleteData = function(){
      if(tmpIDs.length <= 0){
        def.resolve();
        return;
      }
      var curKey = tmpIDs.pop();
      store.removeItem(curKey).catch(function(){}).then(function(){
        deleteData();
      });
    };
    deleteData();

    return def.promise;
  };

  BrowserStore.prototype.clearAllEvents = function(){
    return this._store.clear();
  };

  BrowserStore.prototype.getAllEvents = function(){
    var def = new Deferred();
    var data = [];
    var store = this._store;
    store.iterate(function(val, key, iterationNum){
      var rehydratedEvt = new Event(val);
      rehydratedEvt._tmpID = key;
      data.push(rehydratedEvt);
    }).then(function(){
      def.resolve(data);
    }).catch(function(e){
      def.reject(e);
    });

    return def.promise;
  };

  BrowserStore.prototype._saveState = function(event){
    return this._store.setItem(event._tmpID,event.toJSON());
  };

  BrowserStore.prototype._validateStoreState = function(){
    var bStore = this;
    var def = new Deferred();
    var promises = [];
    var store = this._store;
    store.keys().then(function(result){
      var keys = result;
      var now = new Date().getTime();
      var accessCount = keys.length - bStore.maxStoreSize;

      keys.sort(function(a,b){
        return (+(a.split('-')[1]))-(+(b.split('-')[1]));
      });

      if(accessCount > 0){
        for(var i = 0; i < accessCount; i++){
          promises.push(store.removeItem(keys.shift()));
        }
      }

      Promise.settle(promises).then(function(){
        def.resolve();
      });
    }).catch(function(){
      def.reject();
    });

    return def.promise;
  };


  return BrowserStore;
})();
