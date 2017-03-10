function MemoryStore(){
  this.store = {};
}

MemoryStore.prototype = {
  createInstance: function(){
    return this;
  },
  getItem: function(key){
    return Promise.resolve(this.store[key]);
  },
  setItem: function(key,value){
    this.store[key] = value;
    return Promise.resolve();
  },
  removeItem: function(key){
    delete this.store[key];
    return Promise.resolve();
  },
  iterate: function(callback){
    var store = this;
    var keys = Object.keys(this.contents);
    for(var i = 0; i < keys.length; i++){
      callback(this.contents[keys[i]],keys[i],i);
    }
    return Promise.resolve();
  }
};

module.exports = MemoryStore;