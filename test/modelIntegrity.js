var should = require('should');
var mockery = require('mockery');
var ModelUtil = require('./_util/model');

var getArgs = function(func) {
  // First match everything inside the function argument parens.
  var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return args.split(',').map(function(arg) {
    // Ensure no inline comments are parsed and trim the whitespace.
    return arg.replace(/\/\*.*\*\//, '').trim();
  }).filter(function(arg) {
    // Ensure no undefined values are added.
    return arg;
  });
};

describe('Model Integrity',function(){
  var Flybits;
  before(function(){
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    Flybits = require('../index.js');
  });
  after(function(){
    mockery.disable();
  });

  it('Moment model implements interfaces',function(){
    var proto = Flybits.Moment.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
  it('MomentInstance model implements interfaces',function(){
    var proto = Flybits.MomentInstance.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
  it('Tag model implements interfaces',function(){
    var proto = Flybits.Tag.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
  it('User model implements interfaces',function(){
    var proto = Flybits.User.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
  it('Zone model implements interfaces',function(){
    var proto = Flybits.Zone.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
  it('ZoneMomentInstance model implements interfaces',function(){
    var proto = Flybits.ZoneMomentInstance.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
});

describe('ContextPlugin Integrity',function(){
  var Flybits;
  before(function(){
    global.window = {};
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    require('../index.js');
    Flybits = window.Flybits;
  });
  after(function(){
    delete global.window;
    mockery.disable();
  });

  it('Location context plugin implements interfaces',function(){
    var proto = Flybits.context.Location.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
  it('Connectivity context plugin implements interfaces',function(){
    var proto = Flybits.context.Connectivity.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
});

describe('Analytics Event Integrity', function(){
  var Flybits;
  before(function(){
    global.window = {};
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    require('../index.js');
    Flybits = window.Flybits;
  });
  after(function(){
    delete global.window;
    mockery.disable();
  });

  it('Event implements interfaces', function(){
    var proto = Flybits.analytics.Event.prototype;
    var interfaces = proto._interfaces;
    for(var i = 0; i < interfaces.length; i++){
      var interface = Flybits.interface[interfaces[i]];
      if(interface){
        ModelUtil.checkProtoImplementation(proto,interface).should.be.true();
      }
    }
  });
});
