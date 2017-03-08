var ModelUtil = {
  checkProtoImplementation: function(proto,interface){
    var interfaceKeys = Object.keys(interface);
    for(var i = 0; i < interfaceKeys.length; i++){
      var functionName = interfaceKeys[i];
      if(!proto[functionName] || proto[functionName].length !== interface[functionName].length){
        return false;
      }
    }
    return true;
  }
};

module.exports = ModelUtil;