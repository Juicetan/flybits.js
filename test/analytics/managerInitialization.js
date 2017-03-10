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
});