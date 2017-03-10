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
      localStorage: new MemoryStore()
    };
    global.localStorage = window.localStorage;
    global.Flybits = sdkStub;

    require('../../index.js');
    global.Flybits = window.Flybits;
    return Flybits.initObj();
  });
  after(function(){
    delete global.document;
    delete global.window;
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
      Flybits.analytics.Manager.logEvent('testevent',{
        customKey: 'customValue'
      }).then(function(e){
        return Flybits.analytics.Manager._analyticsStore.getAllEvents();
      }).then(function(events){
        events.length.should.be.exactly(1);
        events[0].name.should.be.exactly('testevent');
        events[0].properties.should.be.eql({
          customKey: 'customValue'
        });
        done();
      }).catch(function(e){
        done(e);
      });
    });
  });
});