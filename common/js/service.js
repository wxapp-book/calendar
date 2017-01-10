var wxService = require('wx'),
moment = require('../../lib/moment'),
constant = require('../../common/js/constant'),
service,
taskService,
dateService;


taskService = {
  creat:function(task){
    //第一部分：获取时间对象
    var ms = task.startTimeMs;//日程开始时间的毫秒值
    //读取该毫秒对应缓存的日期对象
    var date = dateService.get({ms:ms});
    var dateKey;
    if(!date){
      dateKey = dateService.create({ms:ms});
      date = dateService.get({key:dateKey});
    }else{
      dateKey = date.key;
    }
    //第二部分：保存日程对象
    var taskKey = taskService.getTaskKey(moment().valueOf());
    task.key = taskKey;
    wxService.setStorage({
      key:taskKey,
      val:task
    });
    //第三个部分：向日期对象添加日程对象
    date.taskKeys = date.taskKeys || [];
    date.taskKeys.push(taskKey);
    dateService.update({
      key:dateKey,
      val:date
    });
  },
  get:function(option,callBack){
    var key = option.key;
    if(callBack && typeof callBack === 'function'){
      wxService.getStorage({key:key},callBack);
    }else{
      return wxService.getStorage({key:key});
    }
  },
  update:function(option,callBack){
    var key = option.key;
    var val = option.val;
    if(callBack && typeof callBack === 'function'){
      wxService.setStorage({
        key:key,
        val:val
      },callBack);
    }else{
      return wxService.setStorage({
        key:key,
        val:val
      });
    }
  },
  delete:function(option,callBack){
    var dayMs = option.dayMs;
    var taskKey = option.taskKey;
    dateService.get({key:dayMs},function(dateObj){
      var taskList = dateObj.taskKeys;
      taskList = taskList.filter(function(a){
        return a !== taskKey;
      });
      dateObj.taskKeys = taskList;
      dateService.update({
        key:dayMs,
        val:dateObj
      },function(){
        console.log(dateService.get({key:dayMs}));
        callBack();
      });
    });


  },
  getDayTasks:function(option,callBack){
    var ms = option.ms;
    var getTasks = function(date){//根据日期对象中的taskKeys对象获取日程对象
      var taskKeyList = date.taskKeys||[];
      var taskList = [];
      for(var i = 0 ; i < taskKeyList.length ; i++){
        taskList.push(taskService.get({key:taskKeyList[i]}));
      }
      if(callBack && typeof callBack==='function'){
      	callBack(taskList);
      }else{
      	return taskList;
      }
    };
    if(callBack && typeof callBack==='function'){//异步
      dateService.get({ms:ms},function(result){//从storage中得到ms对应的日期对象
        getTasks(result);//
      });
    }else{
      var taskList = dateService.get();//同步
      return getTasks(taskList);
    }
  },
  getTaskKey:function(ms){
    var taskKey = 'task_'+ms;
    return taskKey;
  },
  orderTaskByStartTime:function(taskList,orderType){
    return taskList.sort(function(a,b){
      if(orderType === constant.orderType.asc){
        return a.startTimeMs<b.startTimeMs;
      }else{
        return a.startTimeMs>b.startTimeMs;
      }
    });
  },
  orderTaskByEndTime:function(taskList,orderType){
    return taskList.sort(function(a,b){
      if(orderType === constant.orderType.asc){
        return a.endTimeMs<b.endTimeMs;
      }else{
        return a.endTimeMs>b.endTimeMs;
      }
    });
  },
  filterTaskByStatus:function(taskList,status){
    var returnList = taskList;
    returnList =  taskList.filter(function(a){
      var momentStart = moment(a.startTimeMs);//日程开始时间的moment对象
      var momentEnd = moment(a.endTimeMs);//日程结束时间的moment对象
      var now = moment();
      var taskStatus = a.status;
      if(constant.taskStatus.pending===status){
        if(now.isBefore(momentStart)){//当前时间早于开始时间
          return true;
        }
      }else if(constant.taskStatus.current===status &&taskStatus !== constant.taskStatus.finish){
        if(now.isAfter(momentStart)){//当前时间晚于开始时间，并且用户未标记日程结束
          return true;
        }
      }else if(constant.taskStatus.finish===status){
        if(taskStatus === constant.taskStatus.finish){//用户标记日程结束
          return true;
        }
      }
    });
    return returnList;
  },
  getStatus:function(task){
    var momentStart = moment(task.startTimeMs);
    var momentEnd = moment(task.endTimeMs);
    var now = moment();
    var taskStatus = task.status;
    if(taskStatus === 'finish'){
      return taskStatus;
    }else{
      if(now.isBefore(momentStart)){
        return constant.taskStatus.pending;
      }else if(now.isAfter(momentStart)){
        return constant.taskStatus.current;
      }
    }

  }
};

dateService = {
  create:function(option,callBack){
    var key = dateService.getDateKey(option.ms);
    var val = {
      key:key,
      taskKeys:[],
      startTime:moment(option.ms).startOf('day').valueOf(),
      endTime:moment(option.ms).endOf('day').valueOf()
    };
    if(callBack && typeof callBack === 'function'){
      wxService.setStorage({
        key:key,
        val:val
      },function(result){
        callBack(key);
      });
    }else{
       wxService.setStorage({
         key:key,
         val:val
       });
       return key;
    }
  },
  get:function(option,callBack){
    var key = option.key||dateService.getDateKey(option.ms);
    console.log(key);
    if(callBack && typeof callBack==='function'){
      wxService.getStorage({key:key},function(result){
        if(result.errMsg==='getStorage:ok'){
          callBack(result.data);
        }else{
          callBack({});
        }
      });
    }else{
      return wxService.getStorage({
        key:key
      });
    }
  },
  update:function(option,callBack){
    var key = option.key;
    var val = option.val;
    if(callBack && typeof callBack === 'function'){
      wxService.setStorage({
        key:key,
        val:val
      },callBack);
    }else{
      return wxService.setStorage({
        key:key,
        val:val
      });
    }

  },
  getDateKey:function(ms){
    var dateKey = 'date_'+moment(ms).startOf('day').valueOf();
    return dateKey;
  }
};
_fn = {

};
service = {
  taskService:taskService,
  dateService:dateService
};

module.exports = service;


