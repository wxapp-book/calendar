  var moment = require('../lib/moment');
  var us = require('../lib/underscore');

function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}
function getPageData(){
  return us.last(getCurrentPages());
}
calendar = {
  //获取月历对象的入口函数
  getCalendarData:function (calendarType,data){
    var now = data || moment();
    var calendarData;
    if(calendarType === 'm'){//获取一个月的月历
      calendarData = calendar.getMonthData(now);
    }else if(calendarType === 'w'){//获取一个星期的月历
      calendarData = calendar.getWeekData(now);
    }
    return calendarData;
  },
  //获取一个星期的月历
  getWeekData:function(time){
    //周开始日期
    var weekStart = moment(time).startOf('week');
    //周结束日期
    var weekEnd = moment(time).endOf('week');
    var loopMoment = weekStart;//基准日期
    var process = true;
    var weekDays = [];
    while(process){
      weekDays.push({
        year:loopMoment.year(),
        month:loopMoment.month(),
        date:loopMoment.date(),
        weekDay:loopMoment.weekday(),
        key:loopMoment.format('YYYY-MM-DD'),
        ms:loopMoment.valueOf(),
        isToday:loopMoment.format('YYYY-MM-DD')===moment().format('YYYY-MM-DD'),
        isSelect:loopMoment.format('YYYY-MM-DD')===moment().format('YYYY-MM-DD')
      });
      //如果基准日期等于或者超过周结束日期，则停止循环，否则加一天
      if(loopMoment.isSame(weekEnd,'day')||loopMoment.isAfter(weekEnd)){
        process=false;
      }else{
        loopMoment.add(1,'day');
      }
    }
    return weekDays;
  },
  //获取一个月的月历
  getMonthData:function(time){
    //月开始日期
    var monthStart = moment(time).startOf('month');
    //月结束日期
    var monthEnd = moment(time).endOf('month');
    var loopMoment = monthStart;//基准日期
    var process = true;
    var monthWeeks = [];
    while(process){
      //获取一个星期的数据
      var weeks = calendar.getWeekData(loopMoment);
      monthWeeks.push({
        key:loopMoment.format('YYYY-W'),
        month:loopMoment.month(),
        weeks:weeks
      });
      //将基准数据加七天，如果等于或者超过月结束日期，则停止循环
      loopMoment.add(7,"day");
      if(loopMoment.isSame(monthEnd,'day')||loopMoment.isAfter(monthEnd)){
        process = false;
      }
    }
    return monthWeeks;
  },
  getSevenDays:function(time){
    time = time || moment();
    var idx = 1;
    var showDays = [];
    var loopMoment = time;
    while(idx<=7){
      showDays.push({
        year:loopMoment.year(),
        month:loopMoment.month(),
        date:loopMoment.date(),
        weekDay:loopMoment.weekday(),
        key:loopMoment.format('YYYY-MM-DD'),
        ms:loopMoment.valueOf(),
        isSelect:idx===1?true:false
      });
      loopMoment.add(1,'day');
      idx++;
    }
    return showDays;
  },
  getToday:function(){
    var today = moment();
    return {
        year:today.year(),
        month:today.month(),
        date:today.date(),
        weekDay:today.weekday(),
        key:today.format('YYYY-MM-DD'),
        ms:today.valueOf()
      };
  }
};

module.exports = {
  formatTime: formatTime,
  getPageData:getPageData,
  calendar:calendar
};
