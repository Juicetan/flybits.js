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
  var getSpy;
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
    
    setSpy = sinon.spy(localforage,'setItem');
    getSpy = sinon.spy(localforage,'getItem');

    require('../../index.js');
    global.Flybits = window.Flybits;
    return Flybits.store.Property.ready;
  });
  after(function(){
    delete global.window;
    delete global.localforage;
    delete global.Flybits;
    mockery.disable();
  });

  it('should be an instance of ForageStore', function(done){
    Flybits.store.Property.storageEngine.constructor.name.should.be.exactly('ForageStore');
  });

  it('should have tested support', function(){
    setSpy.should.be.calledOnce();
    getSpy.should.be.calledOnce();
  });
});

