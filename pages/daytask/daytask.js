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
		_fn.init();
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
		var grid = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
		for(var i = 0 ; i < taskList.length ; i++){
			var task = taskList[i];
			var process = true;
			var lineIdx = 0;
			while(process){
				if(!grid[lineIdx]){
					grid[lineIdx]=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				}
				var line = grid[lineIdx];
				var addRes = _fn.addTaskToLink(task,line);
				if(addRes === true){
					process = false;
				}else{
					lineIdx ++;
				}
			}
		}
		console.log("grid",grid);
		// return;
		_fn.getCurPage().setData({
			grid:grid,
			timeLine:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
		});
	},
	addTaskToLink:function(task,line){
		var startTime = moment(task.startTimeMs);
		var endTime = moment(task.endTimeMs);
		var checkStart = startTime.hour()>=0?startTime.hour():0;
		var checkEnd = endTime.hour()>=0?endTime.hour():0;
		var startPer;
		var endPer;
		var middlePer;
		var startPos;
		if(checkStart === checkEnd){
			startPos = (1-startTime.minute()/60)*100+'rpx';
			middlePer = ((endTime.minute() - startTime.minute())/60)*100+'%';
		}else{
			startPer = (1-startTime.minute()/60)*100+'%';
			endPer = (endTime.minute()/60)*100+'%';
		}

		for(var i = checkStart ; i <= checkEnd ; i++){
			if(line[i]!==0){
				return false;
			}
		}
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
			calendar : sevenDays
		});
	}

};

