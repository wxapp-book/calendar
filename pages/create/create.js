

var _fn,
  taskService = require('../../common/js/service').taskService,
  dateService = require('../../common/js/service').dateService,
  moment = require('../../lib/moment'),
  us = require('../../lib/underscore'),
  utils = require('../../utils/util'),
  app = getApp();
Page({
  data:{},
  onLoad:function(option){
    var pageType = option.pageType||'create';
    var task;
    var curDate;
    if(pageType === 'create'){
      var ms = option.ms || new Date().getTime();
      curDate = moment(ms,"x");
      task = {
        title:"新建任务",
        important:"一般",
        date:moment(ms,'x').format("YYYY-MM-DD")
      };
    }else{
      var key = option.key;
      if(key){
        task = taskService.get({key:key});
        curDate = moment(task.startTimeMs);
      }
    }
    this.setData({curDate:curDate});
    var taskTime = _fn.getTaskTime(task);
    var taskImportant = ['一般','重要'];
    this.setData({
      task:task,
      taskTime:taskTime,
      taskImportant:taskImportant,
      pageType:pageType,
    });
  },
  onChangeTitle:function(e){
    var task = _fn.getCurTask();
    var value = e.detail.value;
    task.title = value;
    var addBtnStatus = value.length>0?"active":"inActive";
    this.setData({
      addBtnStatus:addBtnStatus
    });
  },
  onChangeImportant:function(e){
    var task = _fn.getCurTask();
    var value = e.detail.value;
    task.important = _fn.mapImportant(value);
    this.setData({task:task});
  },
  onChangeStartTime:function(e){
    var task = _fn.getCurTask();
    var value = e.detail.value;
    console.log(e);
    task.startTime = value;
    var taskTime = _fn.getTaskTime();
    utils.getPageData().setData({taskTime:taskTime});

  },
  onChangeEndTime:function(e){
    var task = _fn.getCurTask();
    var value = e.detail.value;
    task.endTime = value;
    var taskTime = _fn.getTaskTime();
    utils.getPageData().setData({taskTime:taskTime});
  },
  onChangeAllDay:function(e){
    var task = _fn.getCurTask();
    var value = e.detail.value;
    if(value === true){
      task.startTime = "00:00";
      task.endTime = "24:59";
    }else{
      task.startTime = null;
      task.endTime = null;
    }
    var taskTime = _fn.getTaskTime();
    utils.getPageData().setData({taskTime:taskTime});
  },
  saveTask:function(e){
    var task = _fn.getCurTask();
    taskService.creat(task);
    wx.navigateBack({
      delta:1
    });
  },
  updateTask:function(e){
    var taskKey = e.target.dataset.taskkey;
    var task = _fn.getCurTask();
    taskService.update({
      key:taskKey,
      val:task
    });
    wx.navigateBack({
      delta:1
    });
  },
  cancelTask:function(e){
    wx.navigateBack({
      delta:1
    });
  },
  removeTask:function(){
    var task = _fn.getCurTask();
    var dayMs = dateService.getDateKey(moment(task.date).valueOf());
    taskService.delete({
      dayMs:dayMs,
      taskKey:task.key
    },function(){
      wx.navigateBack({
        delta:1
      });
    });
  }
});
_fn = {
  getCurTask : function(){
    var task = utils.getPageData().data.task;
    // console.log(task);
    return task;
  },
  getTaskTime:function(task){
    task = task || {};
    var now = utils.getPageData().data.curDate;
    var dateStr = task.date || now.format('YYYY-MM-DD');
    var curTask = _fn.getCurTask()||task||{};
    var startTime = curTask.startTime?curTask.startTime:now.format("HH:mm");
    var startTimeMoment = moment(dateStr+" "+startTime);
    var endTimeMoment;
    if(curTask.endTime){
      endTimeMoment = moment(dateStr+" "+curTask.endTime);
      if(!endTimeMoment.isAfter(startTimeMoment)){
        endTimeMoment = moment(startTimeMoment);
        endTime = endTimeMoment.add(1,'h').format("HH:mm");
      }else{
        endTime = curTask.endTime;
      }
    }else{
      endTimeMoment = moment(startTimeMoment);
      endTimeMoment = endTimeMoment.add(1,'h');
      endTime = endTimeMoment.format("HH:mm");
    }
    curTask.startTimeMs = startTimeMoment.valueOf();
    curTask.endTimeMs = endTimeMoment.valueOf();
    curTask.startTime = startTime;
    curTask.endTime=endTime;


    var startTimeBeginLimit = now.format("HH:mm");
    var endTimeBeginLimit = startTime;

    var taskTime = {
      startTime:startTime,
      endTime:endTime,
      startTimeBeginLimit:startTimeBeginLimit,
      endTimeBeginLimit:endTimeBeginLimit,
      date:dateStr

    };
    return taskTime;
  },
  mapImportant:function(key){
    var map = {
      "0":"一般",
      "1":"重要"
    };
    return map[key];
  }

};
