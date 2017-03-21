var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');
require('should-sinon');
var fetchMock = require('fetch-mock');

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

describe('Fetch Wrapper Verfication',function(){
  before(function(){
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    global.Flybits = require('../../index.js');
  });
  after(function(){
    delete global.Flybits;
    mockery.disable();
  });

  it('should resolve on 200s', function(done){
    fetchMock.get('*', 200);
    Flybits.util.Api.fetch('/test/').then(function(){
      done();
    }).catch(function(e){
      done(e);
    });
    fetchMock.restore();
  });

  describe('should reject on >200s', function(done){
    it('should reject on 300s', function(){
      fetchMock.get('*', 300);
      Flybits.util.Api.fetch('/test/').then(function(e){
        done(e);
      }).catch(function(e){
        done();
      });
      fetchMock.restore();
    });

    it('should reject on 400s', function(done){
      fetchMock.get('*', 400);
      Flybits.util.Api.fetch('/test/').then(function(e){
        done(e);
      }).catch(function(e){
        done();
      });
      fetchMock.restore();
    });

    it('should reject on 500s', function(done){
      fetchMock.get('*', 500);
      Flybits.util.Api.fetch('/test/').then(function(e){
        done(e);
      }).catch(function(e){
        done();
      });
      fetchMock.restore();
    });
  });

  describe('Allow for JSON parse option', function(){
    it('should retain string response if no json flag', function(done){
      fetchMock.get('*', "{\"x\": 3}");
      Flybits.util.Api.fetch('/test/').then(function(e){
        e.should.be.a.String();
        done();
      }).catch(function(e){
        done(e);
      });
      fetchMock.restore();
    });
    
    it('should resolve with Object response if json flag', function(done){
      fetchMock.get('*', "{\"x\": 3}");
      Flybits.util.Api.fetch('/test/',{
        respType: 'json'
      }).then(function(e){
        e.should.be.an.Object();
        done();
      }).catch(function(e){
        done(e);
      });
      fetchMock.restore();
    });
  });

    
});