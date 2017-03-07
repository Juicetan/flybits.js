var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');
require('should-sinon');
var MemoryStore = require('../_assets/memoryStore.js');

describe('Browser: Property storage initialization is asynchronous',function(){
  var Flybits;
  var initSpy;
  before(function(){
    global.window = {};
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    require('../../index.js');
    Flybits = window.Flybits;
  });
  after(function(){
    delete global.window;
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

describe('Browser: LocalForage based property storage initialization',function(){
  var removeSpy;
  var setSpy;

  before(function(){
    global.window = {
      localforage: new MemoryStore()
    };
    global.localforage = window.localforage;
    global.Flybits = {
      cfg: {
        store: {
          SDKPROPS: 'flb.sdk.properties',
          RESOURCEPATH: "./res/",
          DEVICEID: 'flb_device',
          USERTOKEN: 'flb_usertoken',
          USERTOKENEXP: 'flb_usertoken_expiry'
        }
      }
    }

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
    delete global.window;
    delete global.localforage;
    delete global.Flybits;
    setSpy.restore();
    removeSpy.restore();
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

describe('Browser: LocalStorage based property storage initialization',function(){
  var removeSpy;
  var setSpy;

  before(function(){
    global.window = {
      localStorage: new MemoryStore()
    };
    global.localStorage = window.localStorage;
    global.Flybits = {
      cfg: {
        store: {
          SDKPROPS: 'flb.sdk.properties',
          RESOURCEPATH: "./res/",
          DEVICEID: 'flb_device',
          USERTOKEN: 'flb_usertoken',
          USERTOKENEXP: 'flb_usertoken_expiry'
        }
      }
    }

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
    delete global.window;
    delete global.localStorage;
    delete global.Flybits;
    setSpy.restore();
    removeSpy.restore();
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
  before(function(){
    global.document = {
      cookie: ""
    };
    global.window = {};

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    
    require('../../index.js');
    global.Flybits = window.Flybits;
    return Flybits.store.Property.ready;
  });
  after(function(){
    delete global.document;
    delete global.window;
    delete global.Flybits;
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
    global.document = {
      cookie: ""
    };
    global.window = {
      localforage: new MemoryStore(),
      localStorage: new MemoryStore(),
    };
    global.localforage = window.localforage;
    global.localStorage = window.localStorage;

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
    delete global.document;
    delete global.window;
    delete global.localStorage;
    delete global.localforage;
    delete global.Flybits;
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