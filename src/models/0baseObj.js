/**
 * @classdesc Base class from which all core Flybits classes are extended.
 * @class
 */
var BaseObj = (function(){
  function BaseObj(){};
  BaseObj.prototype = {
    implements: function(interfaceName){
      if(!this._interfaces){
        this._interfaces = [];
      }
      this._interfaces.push(interfaceName);
    }
  };

  return BaseObj;
})();
