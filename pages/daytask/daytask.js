var app = getApp();
var calendar = require('../../utils/util').calendar;
var taskService = require('../../common/js/service').taskService;
var constant = require('../../common/js/constant');
var us = require('../../lib/underscore');
var moment = require('../../lib/moment');
var wxService = require('../../common/js/wx');
var _fn;

Page({
  addTask:function(e){
  var ms = _fn.getCurPage().data.curDate.valueOf();
    wx.navigateTo({
    url:'../create/create?pageType=create&ms='+ms
    });
  },
  chooseTime:function(e){
  var key = e.target.dataset.taskkey;
  if(!key){
    _fn.hideDetailPop();
  }else{
    if(_fn.getCurPage().data.selectTask && _fn.getCurPage().data.selectTask.key===key){
    return;
    }
    taskService.get({key:key},function(res){
    res.data.curStatus = taskService.getStatus(res.data);
    _fn.getCurPage().setData({
      selectTask:res.data,
    });
    _fn.showDetailPop();
    });
  }
  },
  chooseDate:function(e){
  var ms = e.currentTarget.dataset.ms;
  _fn.getCurPage().data.curDate = moment(ms,'x');
  var calendar = _fn.getCurPage().data.calendar;
  for(var i = 0 ; i < calendar.length ; i++){
    if(calendar[i].ms === ms*1){
    calendar[i].isSelect = true;
    }else{
    calendar[i].isSelect = false;
    }
  }
  _fn.getCurPage().setData({calendar:calendar});
  _fn.init();
  },
  onShow:function(){
  _fn.init();
  },
  onLoad:function(param){
  var ms = param.ms || new Date().getTime();
  _fn.getCurPage().data.curDate = moment(ms,'x');
  _fn.getCalendar();
  },
  goUpdataTask:function(){
  var key = _fn.getCurPage().data.selectTask.key;
  wx.navigateTo({//youbug
    url:'../create/create?pageType=update&key='+key
    });
  },
  finishTask:function(){
  var key = _fn.getCurPage().data.selectTask.key;
  var task = _fn.getCurPage().data.selectTask;
  task.status='finish';
  taskService.update({
      key:key,
      val:task
    });
    _fn.init();
  },
  hideDetailPop:function(e){
    _fn.hideDetailPop();
  }
});
_fn = {
  init:function(){
  var moment = _fn.getCurPage().data.curDate || moment();
  _fn.getTasks(moment,function(taskList){
    _fn.getTaskGrid(taskList);
  });
  },
  getCurPage:function(){
    return us.last(getCurrentPages());
  },
  hideDetailPop:function(){
  if(_fn.getCurPage().data.detailPop!=="hide"){
    _fn.getCurPage().setData({
    detailPop:"hide"
    });
    _fn.getCurPage().setData({
    selectTask:{}
    });

  }
  },
  showDetailPop:function(){
  if(_fn.getCurPage().data.detailPop!=="show"){
    _fn.getCurPage().setData({
    detailPop:"show"
    });
  }
  },
  getTasks:function(date,callBack){
  date = date || new moment();
  var ms = date.valueOf();
  taskService.getDayTasks({ms:ms},function(taskList){
    // taskList = taskService.orderTaskByStartTime(taskList,constant.orderType.asc);
    if(typeof callBack === 'function'){
    var curTaskList = taskService.filterTaskByStatus(taskList,constant.taskStatus.current);
    var penTaskList = taskService.filterTaskByStatus(taskList,constant.taskStatus.pending);
    var renderTaskList= [].concat(curTaskList).concat(penTaskList);
    callBack(renderTaskList);
    }
  });
  },
  getTaskGrid:function(taskList){
	  //默认表格数据，只有一列全部为0
	  var grid = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
	  for(var i = 0 ; i < taskList.length ; i++){
	    var task = taskList[i];
	    var process = true;
	    var lineIdx = 0;//当前遍历的列序号
	    while(process){
	    if(!grid[lineIdx]){//如果列不存在则创建
	      grid[lineIdx]=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	    }
	    var line = grid[lineIdx];
	    //将任务添加到列中，如果成功结束结束循环，不成功则增加列序号，继续遍历下一列
	    var addRes = _fn.addTaskToLink(task,line);
	    if(addRes === true){
	      process = false;
	    }else{
	      lineIdx ++;
	    }
	    }
	  }
	  //将表格数据渲染到页面上
	  _fn.getCurPage().setData({
	    grid:grid,
	    timeLine:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
	  });
  },
  addTaskToLink:function(task,line){
	  var startTime = moment(task.startTimeMs);
	  var endTime = moment(task.endTimeMs);
	  //日程开始的小时值
	  var checkStart = startTime.hour()>=0?startTime.hour():0;
	  //日程结束的小时值
	  var checkEnd = endTime.hour()>=0?endTime.hour():0;
	  //起点占表格的百分比
	  var startPer;
	  //终点占表格的百分比
	  var endPer;
	  //中间占表百分比
	  var middlePer;
	  var startPos;
	  //开始点与结束点在同一个表格
	  if(checkStart === checkEnd){
	    startPos = (1-startTime.minute()/60)*100+'rpx';
	    middlePer = ((endTime.minute() - startTime.minute())/60)*100+'%';
	  }else{//开始点与结束点在不同的表格
	    startPer = (1-startTime.minute()/60)*100+'%';
	    endPer = (endTime.minute()/60)*100+'%';
	  }

	  //如果被检查列的开始到结束的元素中，又不是0的元素，则该列不能添加当前日程
	  for(var i = checkStart ; i <= checkEnd ; i++){
	    if(line[i]!==0){
	    return false;
	    }
	  }
	  //将表格的开始到结束元素全部幅值为日程数据
	  for(var j = checkStart ; j <= checkEnd ; j++){
	    var isMiddle = checkStart === checkEnd;
	    var isStart,isEnd;
	    if(!isMiddle){
	    isStart = j===checkStart;
	    isEnd = j===checkEnd;
	    }
	    line[j] = {
	    middlePer:isMiddle?middlePer:null,
	    startPos:isMiddle?startPos:null,
	    startPer:isStart?startPer:null,
	    endPer:isEnd?endPer:null,
	    task:task
	    };
	  }
	  return true;
  },
  getCalendar:function(){
  var firstDay = moment(_fn.getCurPage().data.curDate);
  var sevenDays = calendar.getSevenDays(firstDay);
  _fn.getCurPage().setData({
    calendar : sevenDays,
    days:constant.calendar.dayShort
  });
  }

};

