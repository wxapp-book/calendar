var app = getApp();
var constant = require('../../common/js/constant');
var taskService = require('../../common/js/service').taskService;
var wxService = require('../../common/js/wx');
var us = require('../../lib/underscore');
var moment = require('../../lib/moment');
var calendar = require('../../utils/util').calendar;
Page({
  data: {
  },
  addTask:function(e){
    wx.navigateTo({//youbug
      url:'../create/create?pageType=create'
    });
  },
  selectTask:function(e){
    //日程Key
    var key = e.currentTarget.dataset.key;
    //日程的当前状态
    var status = e.currentTarget.dataset.status;
    //未开始的日程：只展示修改按钮
    if(status === constant.taskStatus.pending){
      wx.showActionSheet({
        itemList:["修改"],
        complete:function(res){
          if(res.errMsg === 'showActionSheet:ok'){
            _fn.handleSelectTask(res.tapIndex,status,key);
          }
        }
      });
    //已开始的日程：展示修改和完成按钮
    }else if(status === constant.taskStatus.current){
      wx.showActionSheet({
        itemList:["修改","完成"],
        complete:function(res){
         if(res.errMsg === 'showActionSheet:ok'){
            _fn.handleSelectTask(res.tapIndex,status,key);
          }
        }
      });
    }
  },
  selectDate:function(e){
    var weekIdx = e.currentTarget.dataset.weekidx/1;
    var daysIdx = e.currentTarget.dataset.daysidx/1;
    var calendar = this.data.calendar;
    for(var i = 0 ; i<calendar.length; i++){
      var c_week = calendar[i].weeks;
      for(var j = 0 ; j<c_week.length;j++){
        var c_date = c_week[j];
        if(i===weekIdx && j===daysIdx){
          c_date.isSelect=true;
          this.setData({selectDate:c_date});
        }else{
          c_date.isSelect=false;
        }

      }
    }
    this.setData({calendar:calendar});
  },
  goDayTask:function(e){
    var ms = e.currentTarget.dataset.ms;
    wx.navigateTo({//youbug
      url:'../daytask/daytask?ms='+ms
    });
  },
  onLoad: function () {
    // wxService.clearStorage();
    _fn.getCurPage().setData({
      now:new Date().getTime(),
      days:constant.calendar.dayShort,
      calendar:calendar.getCalendarData('m'),
      selectDate:calendar.getToday()
    });
  },
  onShow:function(){
    _fn.init();
  }

});


_fn = {
  init:function(){
    _fn.groupTask();
  },
  getCurPage:function(){
    return us.last(getCurrentPages());
  },
  groupTask:function(){
    var ms = new Date().getTime();
    taskService.getDayTasks({ms:ms},function(taskList){
      var penList = taskService.filterTaskByStatus(taskList,constant.taskStatus.pending);
      var curList = taskService.filterTaskByStatus(taskList,constant.taskStatus.current);
      var finList = taskService.filterTaskByStatus(taskList,constant.taskStatus.finish);

      penList = taskService.orderTaskByStartTime(penList,constant.orderType.asc);
      curList = taskService.orderTaskByEndTime(curList,constant.orderType.asc);
      finList = taskService.orderTaskByEndTime(finList,constant.orderType.desc);

      var groupTask = {
        penList:penList,
        curList:curList,
        finList:finList
      };
      _fn.getCurPage().setData({
        groupTask:groupTask
      });
    });
  },
  handleSelectTask:function(selectIdx,status,key){
    //未开始的日程
    if(status === constant.taskStatus.pending){
      if(selectIdx===0){//去日程详情页
        _fn.goUpdaeTask(key);
      }
    //未结束的日程
    }else if(status === constant.taskStatus.current){
      if(selectIdx===0){//去日程详情页
        _fn.goUpdateTask(key);
      }else if(selectIdx===1){//修改日程状态为完成
        var taskList = _fn.getCurPage().data.groupTask.curList;
        //从groupTask对象中获取用户选定日程
        var task = taskList.filter(function(a){
          return a.key === key;
        })[0];
        task.status='finish';//修改状态
        //更新storage
        taskService.update({
          key:key,
          val:task
        });
        //重新读取当天的日程数据
        _fn.init();
      }
   }
 },
 goUpdateTask:function(key){
  wx.navigateTo({//youbug
      url:'../create/create?pageType=update&key='+key
    });
 }

};

