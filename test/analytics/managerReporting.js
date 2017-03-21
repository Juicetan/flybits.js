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
      APPID: 'xxxx-xxxx-xxxx-xxxx-xxxx',
      REPORTDELAY: 10
    }
  }
};

describe('Analytics Manager Reporting', function(){
  before(function(){
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    global.document = {
      cookie: ""
    };
    global.window = {
      localStorage: new MemoryStore(),
      navigator: {
        userAgent: 'useragent/test'
      }
    };
    global.navigator = window.navigator;
    global.localStorage = window.localStorage;
    global.Flybits = sdkStub;

    require('../../index.js');
    global.Flybits = window.Flybits;
    return Flybits.initObj({
      analytics: {
        REPORTDELAY: 10
      }
    });
  });
  after(function(){
    delete global.document;
    delete global.window;
    delete global.navigator;
    delete global.localStorage;
    delete global.Flybits;
    global.Flybits = sdkStub;
    mockery.disable();
  });

  describe('Starts/stops report interval', function(){
    var clock;
    beforeEach(function(){
      Flybits.store.Session.user = {
        name: 'testuser'
      };
      sinon.stub(Flybits.analytics.Manager,'report').callsFake(function(){
        return Promise.resolve();
      });
      clock = sinon.useFakeTimers();
      return Flybits.analytics.Manager.initialize();
    });
    afterEach(function(){
      Flybits.analytics.Manager.report.restore();
      delete Flybits.store.Session.user;
      clock.restore();
    });

    it('assign timeout reference', function(){
      clock.tick(10);
      Flybits.analytics.Manager._reportTimeout.should.be.an.Object();
    });

    it('should call report on configured interval', function(){
      clock.tick(10);
      Flybits.analytics.Manager.report.callCount.should.be.exactly(2);
    });

    it('should be able to stop configured report interval', function(){
      clock.tick(5);
      Flybits.analytics.Manager.stopReporting();
      clock.tick(5);
      Flybits.analytics.Manager.report.callCount.should.be.exactly(1);
    });
  });

  describe('Reporting impact on persistence layer', function(){
    beforeEach(function(){
      Flybits.store.Session.user = {
        name: 'testuser'
      };
      return Flybits.analytics.Manager.initialize();
    });
    afterEach(function(){
      delete Flybits.store.Session.user;
    });

    it('should clear upon successful report', function(done){
      sinon.stub(Flybits.analytics.Manager._uploadChannel,'uploadEvents').callsFake(function(){
        return Promise.resolve();
      });
      Flybits.analytics.Manager.stopReporting();
      var log1 = Flybits.analytics.Manager.logEvent('testevent1');
      var log2 = Flybits.analytics.Manager.logEvent('testevent2');
      var log3 = Flybits.analytics.Manager.logEvent('testevent3');
      Promise.settle([log1,log2,log3]).then(function(){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(evts){
        evts.should.have.length(3);
        return Flybits.analytics.Manager.report();
      }).then(function(){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(evts){
        evts.should.have.length(0);
        done();
      }).catch(function(e){
        done(e);
      }).then(function(){
        Flybits.analytics.Manager._uploadChannel.uploadEvents.restore();
      });
    });

    it('should not clear upon failed report', function(done){
      sinon.stub(Flybits.analytics.Manager._uploadChannel,'uploadEvents').callsFake(function(){
        return Promise.reject('error');
      });
      Flybits.analytics.Manager.stopReporting();
      var log1 = Flybits.analytics.Manager.logEvent('testevent1');
      var log2 = Flybits.analytics.Manager.logEvent('testevent2');
      var log3 = Flybits.analytics.Manager.logEvent('testevent3');
      Promise.settle([log1,log2,log3]).then(function(){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(evts){
        evts.should.have.length(3);
        return Flybits.analytics.Manager.report();
      }).catch(function(){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(evts){
        evts.should.have.length(3);
        done();
      }).catch(function(e){
        done(e);
      }).then(function(){
        Flybits.analytics.Manager._uploadChannel.uploadEvents.restore();
      });
    })
  });
});