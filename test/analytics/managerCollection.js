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

describe('Analytics Manager Collection', function(){
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
    return Flybits.initObj();
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

  describe('Event Logging', function(){
    beforeEach(function(){
      sinon.stub(Flybits.analytics.Manager,'startReporting',function(){
        return Promise.resolve();
      });
      return Flybits.analytics.Manager.initialize();
    });
    afterEach(function(){
      Flybits.analytics.Manager.startReporting.restore();
    });

    it('Store new discrete event', function(done){
      var testProperty = {
        customKey: 'customValue'
      };
      Flybits.analytics.Manager.logEvent('testevent',testProperty).then(function(e){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(events){
        events.length.should.be.exactly(1);
        events[0].type.should.be.exactly(Flybits.analytics.Event.types.DISCRETE);
        events[0].name.should.be.exactly('testevent');
        events[0].properties.should.be.eql(testProperty);
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('Log discrete event with browser user agent', function(done){
      var testProperty = {
        customKey: 'customValue'
      };
      Flybits.analytics.Manager.logEvent('testevent',testProperty).then(function(e){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(events){
        events[0]._internal.should.have.keys('osType','osVersion');
        events[0]._internal.osType.should.be.exactly('browser');
        events[0]._internal.osVersion.should.be.exactly('useragent/test');
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('Log timed start event', function(done){
      var testProperty = {
        customKey: 'customValue'
      };
      Flybits.analytics.Manager.startTimedEvent('testevent',testProperty).then(function(e){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(events){
        events.length.should.be.exactly(1);
        events[0].type.should.be.exactly(Flybits.analytics.Event.types.TIMEDSTART);
        events[0].name.should.be.exactly('testevent');
        events[0].properties.should.be.eql(testProperty);
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('Log timed start event with browser agent', function(done){
      var testProperty = {
        customKey: 'customValue'
      };
      Flybits.analytics.Manager.startTimedEvent('testevent',testProperty).then(function(e){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(events){
        events[0]._internal.should.have.keys('osType','osVersion','timedRef');
        events[0]._internal.osType.should.be.exactly('browser');
        events[0]._internal.osVersion.should.be.exactly('useragent/test');
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('Log timed start event returns a reference ID', function(done){
      var testProperty = {
        customKey: 'customValue'
      };
      Flybits.analytics.Manager.startTimedEvent('testevent',testProperty).then(function(e){
        e.should.be.a.String();
        done();
      }).catch(function(e){
        done(e);
      });
    });

    it('Log timed end event', function(done){
      var testProperty = {
        customKey: 'customValue'
      };
      var store = Flybits.analytics.Manager._analyticsStore;
      var refID = "";

      Flybits.analytics.Manager.startTimedEvent('testevent',testProperty).then(function(e){
        refID = e;
        return Flybits.analytics.Manager.endTimedEvent(refID);
      }).then(function(){
        return store.getAllEvents();
      }).then(function(events){
        var endEvt = events.filter(function(obj){
          return obj.type === Flybits.analytics.Event.types.TIMEDEND;
        });
        endEvt.should.have.length(1);
        endEvt = endEvt[0];
        endEvt._internal[Flybits.analytics.Event.TIMEDREFID].should.be.exactly(refID);
        done();
      }).catch(function(e){
        done(e);
      });
    });
  });
});