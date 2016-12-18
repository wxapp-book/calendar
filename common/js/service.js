var wxService = require('wx'),
moment = require('../../lib/moment'),
constant = require('../../common/js/constant'),
service,
taskService,
dateService;


taskService = {
  creat:function(task){
    // wxService.clearStorage();
    var ms = task.startTimeMs;
    var date = dateService.get({ms:ms});
    var dateKey;
    if(!date){
      dateKey = dateService.create({ms:ms});
      date = dateService.get({key:dateKey});
    }else{
      dateKey = date.key;
    }

    var taskKey = taskService.getTaskKey(moment().valueOf());
    task.key = taskKey;
    wxService.setStorage({
      key:taskKey,
      val:task
    });

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
  getDayTasks:function(option,callBack){
    var ms = option.ms;
    var getTasks = function(date){
      var taskKeyList = date.taskKeys||[];
      var taskList = [];
      for(var i = 0 ; i < taskKeyList.length ; i++){
        taskList.push(taskService.get({key:taskKeyList[i]}));
      }
      callBack(taskList);
    };
    if(callBack && typeof callBack==='function'){
      dateService.get({ms:ms},function(result){
        getTasks(result);
      });
    }else{
      var taskList = dateService.get();
      getTasks(taskList);
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
      var momentStart = moment(a.startTimeMs);
      var momentEnd = moment(a.endTimeMs);
      var now = moment();
      var taskStatus = a.status;
      if(constant.taskStatus.pending===status){
        if(now.isBefore(momentStart)){
          return true;
        }
      }else if(constant.taskStatus.current===status &&taskStatus !== constant.taskStatus.finish){
        if(now.isAfter(momentStart)){
          return true;
        }
      }else if(constant.taskStatus.finish===status){
        if(taskStatus === constant.taskStatus.finish){
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


