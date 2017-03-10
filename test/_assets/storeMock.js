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
  }
};

module.exports = MemoryStore;