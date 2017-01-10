/**此文件根据业务需求对app自定义的方法进行封装**/
var us = require('../../lib/underscore.js');

var handle = {
  setStorage:function(option,complete){
    var key = option.key;
    var val = option.val;
    if(complete && typeof complete === 'function'){//异步
      wx.setStorage({
        key:key,
        data:val,
        complete:function(data){
          if(us.isFunction(complete)){
            complete(data);
          }
        }
      });
    }else{//同步
      try{
        return wx.setStorageSync(key,val);
      }catch(e){
        console.error(e);
      }
    }
  },
  removeStorage:function(option,complete){
    var key = option.key;
    if(complete && typeof complete === 'function'){//异步
       wx.removeStorage({
        key:key,
        complete:function(data){
          if(us.isFunction(complete)){
            complete(data);
          }
        }
      });
    }else{//同步
      try{
        return wx.removeStorageSync(key);
      }catch(e){
        console.error(e);
      }
    }
  },
  getStorage:function(option,complete){
    var key = option.key;
    if(complete && typeof complete === 'function'){//异步
       wx.getStorage({
        key:key,
        complete:function(data){
          if(us.isFunction(complete)){
            complete(data);
          }
        }
      });
    }else{//同步
      try{
        return wx.getStorageSync(key);
      }catch(e){
        console.error(e);
      }
    }
  },
  clearStorage:function(){
    try{
      return wx.clearStorageSync();
    }catch(e){
      console.error(e);
    }
  }

};


module.exports = handle;