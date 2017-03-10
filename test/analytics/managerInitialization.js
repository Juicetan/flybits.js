var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');
require('should-sinon');
var MemoryStore = require('../_assets/storeMock');

var sdkStub = {
  cfg: {
    store: {
      SDKPROPS: 'flb.sdk.properties',
      RESOURCEPATH: "./res/",
      DEVICEID: 'flb_device',
      USERTOKEN: 'flb_usertoken',
      USERTOKENEXP: 'flb_usertoken_expiry'
    },
    analytics: {
      CHANNELHOST: 'https://analytics.host.com',
      CHANNELKEY: 'analyticschannelkey',
      APPID: 'xxxx-xxxx-xxxx-xxxx-xxxx'
    }
  }
};

describe('Analytics Manager Initialization', function(){
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

  describe('localforage library unavailable', function(){
    before(function(){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      require('../../index.js');
      global.Flybits = window.Flybits;
      Flybits.initObj();
      return Flybits.ready;
    });
    after(function(){
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('initialize temporary storage in memory ', function(done){
      var startReporting = sinon.stub(Flybits.analytics.Manager,'startReporting',function(){
        return Promise.resolve();
      });
      var channelInitSpy = sinon.spy(Flybits.analytics,'DefaultChannel');

      Flybits.analytics.Manager.initialize().then(function(){
        (Flybits.analytics.Manager._analyticsStore instanceof Flybits.analytics.AnalyticsStore).should.be.true();
        (Flybits.analytics.Manager._analyticsStore._store instanceof MemoryStore).should.be.false();
        channelInitSpy.should.be.calledOnce();
        startReporting.should.be.calledOnce();
        done();
        startReporting.restore();
        channelInitSpy.restore();
      }).catch(function(e){
        done(e);
      });
    });
  });
  
  describe('localforage library available', function(){
    before(function(){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      window.localforage = new MemoryStore();
      global.localforage = window.localforage;
      
      require('../../index.js');
      global.Flybits = window.Flybits;
      Flybits.initObj();
      return Flybits.ready;
    });
    after(function(){
      global.Flybits = sdkStub;
      delete global.localforage;
      delete window.localforage;
      mockery.disable();
    });

    it('initialize persistent storage with localforage in IDB', function(done){
      var startReporting = sinon.stub(Flybits.analytics.Manager,'startReporting',function(){
        return Promise.resolve();
      });
      var channelInitSpy = sinon.spy(Flybits.analytics,'DefaultChannel');

      Flybits.analytics.Manager.initialize().then(function(){
        (Flybits.analytics.Manager._analyticsStore instanceof Flybits.analytics.AnalyticsStore).should.be.true();
        (Flybits.analytics.Manager._analyticsStore._store instanceof MemoryStore).should.be.true();
        channelInitSpy.should.be.calledOnce();
        startReporting.should.be.calledOnce();
        done();
        startReporting.restore();
        channelInitSpy.restore();
      }).catch(function(e){
        done(e);
      });
    });
  });

  describe('Default channel initialization', function(){
    before(function(done){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      require('../../index.js');
      global.Flybits = window.Flybits;
      Flybits.initObj().then(function(){
        sinon.stub(Flybits.analytics.Manager,'startReporting',function(){
          return Promise.resolve();
        });
        return Flybits.analytics.Manager.initialize();
      }).then(function(){
        done();
      }).catch(function(e){
        done(e);
      });
    });
    after(function(){
      Flybits.analytics.Manager.startReporting.restore();
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('should be an instance of defined abstract class', function(){
      (Flybits.analytics.Manager._uploadChannel instanceof Flybits.analytics.UploadChannel).should.be.true();
    })
  });

  describe('Persistence store functions', function(){
    beforeEach(function(done){
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      require('../../index.js');
      global.Flybits = window.Flybits;
      Flybits.initObj().then(function(){
        sinon.stub(Flybits.analytics.Manager,'startReporting',function(){
          return Promise.resolve();
        });
        return Flybits.analytics.Manager.initialize();
      }).then(function(){
        done();
      }).catch(function(e){
        done(e);
      });
    });
    afterEach(function(){
      Flybits.analytics.Manager.startReporting.restore();
      global.Flybits = sdkStub;
      mockery.disable();
    });

    it('should be able to log and retrieve single event', function(done){
      var evt = new Flybits.analytics.Event();
      var store = Flybits.analytics.Manager._analyticsStore;
      var stateSaveSpy = sinon.spy(Flybits.analytics.BrowserStore.prototype,'_saveState');

      store.addEvent(evt).then(function(){
        stateSaveSpy.should.be.calledOnce();
        return store.getEvent(evt._tmpID);
      }).then(function(e){
        e.should.be.eql(evt);
        done();
      }).catch(function(e){
        done(e);
      }).then(function(){
        stateSaveSpy.restore();
      });
    });

    it('should be able to clear single event', function(done){
      var store = Flybits.analytics.Manager._analyticsStore;

      var evt1 = new Flybits.analytics.Event();
      var evt2 = new Flybits.analytics.Event();
      var evt3 = new Flybits.analytics.Event();

      Promise.settle([
        store.addEvent(evt1),
        store.addEvent(evt2),
        store.addEvent(evt3)
      ]).then(function(){
        return store.clearEvents([evt1._tmpID]);
      }).then(function(){
        return Promise.settle([
          store.getEvent(evt1._tmpID),
          store.getEvent(evt2._tmpID),
          store.getEvent(evt3._tmpID),
        ]);
      }).then(function(resArr){
        resArr[0].status.should.be.exactly('resolved');
        should(resArr[0].result).be.undefined();
        resArr[1].status.should.be.exactly('resolved');
        resArr[1].result.should.be.eql(evt2);
        resArr[2].status.should.be.exactly('resolved');
        resArr[2].result.should.be.eql(evt3);
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('should be able to clear multiple events', function(done){
      var store = Flybits.analytics.Manager._analyticsStore;

      var evt1 = new Flybits.analytics.Event();
      var evt2 = new Flybits.analytics.Event();
      var evt3 = new Flybits.analytics.Event();

      Promise.settle([
        store.addEvent(evt1),
        store.addEvent(evt2),
        store.addEvent(evt3)
      ]).then(function(){
        return store.clearEvents([evt1._tmpID,evt2._tmpID]);
      }).then(function(){
        return Promise.settle([
          store.getEvent(evt1._tmpID),
          store.getEvent(evt2._tmpID),
          store.getEvent(evt3._tmpID),
        ]);
      }).then(function(resArr){
        resArr[0].status.should.be.exactly('resolved');
        should(resArr[0].result).be.undefined();
        resArr[1].status.should.be.exactly('resolved');
        should(resArr[1].result).be.undefined();
        resArr[2].status.should.be.exactly('resolved');
        resArr[2].result.should.be.eql(evt3);
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('should be able to clear all events', function(done){
      var store = Flybits.analytics.Manager._analyticsStore;

      var evt1 = new Flybits.analytics.Event();
      var evt2 = new Flybits.analytics.Event();
      var evt3 = new Flybits.analytics.Event();

      Promise.settle([
        store.addEvent(evt1),
        store.addEvent(evt2),
        store.addEvent(evt3)
      ]).then(function(){
        return store.clearAllEvents();
      }).then(function(){
        return Promise.settle([
          store.getEvent(evt1._tmpID),
          store.getEvent(evt2._tmpID),
          store.getEvent(evt3._tmpID),
        ]);
      }).then(function(resArr){
        resArr[0].status.should.be.exactly('resolved');
        should(resArr[0].result).be.undefined();
        resArr[1].status.should.be.exactly('resolved');
        should(resArr[1].result).be.undefined();
        resArr[2].status.should.be.exactly('resolved');
        should(resArr[2].result).be.undefined();
        done();
      }).catch(function(e){
        done(e);
      });
    });
  });
});