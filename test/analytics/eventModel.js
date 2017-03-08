var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');
require('should-sinon');

describe('Event model functionality', function(){
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

  it('Default initialization properties', function(){
    var evt = new Flybits.analytics.Event();
    evt.should.be.an.Object();
    evt._tmpID.should.not.be.empty();
    evt._tmpID.should.be.a.String();
    evt._isInternal.should.be.false();
    evt.type.should.be.exactly(Flybits.analytics.Event.types.DISCRETE);
    evt.loggedAt.should.be.a.Date();
  });
  it('can override properties upon initialization', function(){
    var Event = Flybits.analytics.Event;
    var parsingSpy = sinon.spy(Event.prototype,'fromJSON');
    var evt = new Event({});
    parsingSpy.should.be.calledOnce();

    evt = new Event({
      name: 'wahoo'
    });
    parsingSpy.should.be.calledTwice();
    evt.name.should.be.exactly('wahoo');

    evt = new Event({
      type: Event.types.TIMEDSTART
    });
    parsingSpy.should.be.calledThrice();
    evt.type.should.be.exactly(Event.types.TIMEDSTART);

    var now = Date.now();
    evt = new Event({
      loggedAt: now
    });
    parsingSpy.should.be.called(4);
    evt.loggedAt.should.be.a.Date();
    evt.loggedAt.getTime().should.be.exactly(now);

    var customProperty = {
      uid: '2423424'
    };
    
    evt = new Event({
      properties: customProperty
    });
    parsingSpy.should.be.called(5);
    evt.properties.should.be.exactly(customProperty);
    
    evt = new Event({
      flbProperties: customProperty
    });
    parsingSpy.should.be.called(6);
    evt._internal.should.be.exactly(customProperty);

    evt = new Event({
      isFlybits: true
    });
    parsingSpy.should.be.called(7);
    evt._isInternal.should.be.true();

    parsingSpy.restore();
  });

  it('Custom property setter should set mapping on properties object', function(){
    var evt = new Flybits.analytics.Event();
    evt.setProperty('key','value123');

    evt.properties.should.have.keys('key');
    evt.properties.key.should.be.exactly('value123');
    evt._internal.should.not.have.keys('key');
  });

  it('Custom property setter should be able to unmap properties object', function(){
    var evt = new Flybits.analytics.Event();
    evt.setProperty('key','value123');
    evt._setInternalProperty('key','value123');
    evt.setProperty('key',null);

    evt.properties.should.not.have.keys('key');
    evt._internal.should.have.keys('key');
  });

  it('Internal property setter should set mapping on internal properties object',function(){
    var evt = new Flybits.analytics.Event();
    evt._setInternalProperty('key','value123');

    evt._internal.should.have.keys('key');
    evt._internal.key.should.be.exactly('value123');
    evt.properties.should.not.have.keys('key');
  });
  
  it('Internal property setter should be able to unmap internal properties object', function(){
    var evt = new Flybits.analytics.Event();
    evt.setProperty('key','value123');
    evt._setInternalProperty('key','value123');
    evt._setInternalProperty('key',null);

    evt._internal.should.not.have.keys('key');
    evt.properties.should.have.keys('key');
  });

  it('should serialize expected types', function(){
    var customProperty = {
      uid: '2423424'
    };
    var customInternalProperty = {
      sort: 'abcd'
    };

    var evt = new Flybits.analytics.Event({
      name: 'newevent',
      properties: customProperty,
      flbProperties: customInternalProperty
    });

    var output = evt.toJSON();
    output.should.have.keys('name','type','properties','loggedAt','flbProperties','isFlybits');
    output.name.should.be.exactly('newevent');
    output.type.should.be.a.String();
    output.properties.should.be.exactly(customProperty);
    output.loggedAt.should.be.a.Number();
    output.flbProperties.should.be.exactly(customInternalProperty);
    output.isFlybits.should.be.a.Boolean();
  });
});