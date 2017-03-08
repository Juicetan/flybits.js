var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');
require('should-sinon');
var MemoryStore = require('../_assets/storeMock.js');

var sdkStub = {
  cfg: {
    store: {
      SDKPROPS: 'flb.sdk.properties',
      RESOURCEPATH: "./res/",
      DEVICEID: 'flb_device',
      USERTOKEN: 'flb_usertoken',
      USERTOKENEXP: 'flb_usertoken_expiry'
    }
  }
};

describe('Browser: Property Storage', function(){
  before(function(){
    global.document = {
      cookie: ""
    };
    global.window = {
      localStorage: new MemoryStore()
    };
    global.localStorage = window.localStorage;
    global.Flybits = sdkStub;
  });
  after(function(){
    delete global.document;
    delete global.window;
    delete global.localStorage;
    delete global.Flybits;
  });

  describe('initialization is asynchronous',function(){
    var initSpy;
    before(function(){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      require('../../index.js');
      global.Flybits = window.Flybits;
    });
    after(function(){
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('should return a Promise',function(){
      Flybits.store.Property.init().should.be.a.Promise();
    });
    
    it('should return a Promise that resolves and resolves store.ready Promise',function(){
      Flybits.store.Property.init().should.eventually.be.an.Object();
      Flybits.store.Property.ready.should.be.fulfilled();
    });
  });

  describe('LocalForage based property storage initialization',function(){
    var removeSpy;
    var setSpy;

    before(function(){
      window.localforage = new MemoryStore();
      global.localforage = window.localforage;

      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
      
      setSpy = sinon.spy(localforage, 'setItem');
      removeSpy = sinon.spy(localforage, 'removeItem');

      require('../../index.js');
      global.Flybits = window.Flybits;
      return Flybits.store.Property.ready;
    });
    after(function(){
      setSpy.restore();
      removeSpy.restore();
      global.Flybits = sdkStub;
      delete global.localforage;
      delete window.localforage;
      mockery.disable();
    });

    it('should be an instance of ForageStore', function(){
      Flybits.store.Property.storageEngine.constructor.name.should.be.exactly('ForageStore');
    });

    it('should have tested support', function(){
      setSpy.should.be.calledOnce();
      removeSpy.should.be.calledOnce();
    });
  });

  describe('LocalStorage based property storage initialization',function(){
    var removeSpy;
    var setSpy;

    before(function(){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
      
      setSpy = sinon.spy(localStorage, 'setItem');
      removeSpy = sinon.spy(localStorage, 'removeItem');

      require('../../index.js');
      global.Flybits = window.Flybits;
      return Flybits.store.Property.ready;
    });
    after(function(){
      setSpy.restore();
      removeSpy.restore();
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('should be an instance of LocalStorageStore', function(){
      Flybits.store.Property.storageEngine.constructor.name.should.be.exactly('LocalStorageStore');
    });

    it('should have tested support', function(){
      setSpy.should.be.calledOnce();
      removeSpy.should.be.calledOnce();
    });
  });

  describe('Cookie based property storage initialization',function(){
    var localStorageStub;
    before(function(){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      localStorageStub = sinon.stub(localStorage,'setItem',function(){
        throw e;
      });

      require('../../index.js');
      global.Flybits = window.Flybits;
      return Flybits.store.Property.ready;
    });
    after(function(){
      localStorageStub.restore();
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('should be an instance of CookieStore', function(){
      Flybits.store.Property.storageEngine.constructor.name.should.be.exactly('CookieStore');
    });

    it('should have tested support', function(){
      document.cookie.should.not.be.empty();
    });
  });

  describe('Safari private browsing', function(){
    var localForageRemoveSpy;
    var localForageSetSpy;
    var localStorageRemoveSpy;
    var localStorageSetSpy;

    before(function(){
      window.localforage = new MemoryStore();
      global.localforage = window.localforage;

      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      localForageSetSpy = sinon.stub(localforage, 'setItem', function(){
        return Promise.reject();
      });
      localForageRemoveSpy = sinon.spy(localforage, 'removeItem');

      localStorageSetSpy = sinon.stub(localStorage, 'setItem', function(){
        throw e;
      });
      localStorageRemoveSpy = sinon.spy(localStorage, 'removeItem');
      
      require('../../index.js');
      global.Flybits = window.Flybits;
      return Flybits.store.Property.ready;
    });
    after(function(){
      localForageSetSpy.restore();
      localForageRemoveSpy.restore();
      localStorageSetSpy.restore();
      localStorageRemoveSpy.restore();
      delete global.localforage;
      delete window.localforage;
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('localforage should reject support', function(){
      localForageSetSpy.should.be.calledOnce();
      localForageRemoveSpy.notCalled.should.be.true();
    });
    it('localStorage should reject support', function(){
      localStorageSetSpy.should.be.calledOnce();
      localStorageRemoveSpy.notCalled.should.be.true();
    });
    it('failover to cookie support', function(){
      Flybits.store.Property.storageEngine.constructor.name.should.be.exactly('CookieStore');
      document.cookie.should.not.be.empty();
    });
  });
});