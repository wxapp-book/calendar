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
  getCalendarData:function (calendarType,data){
    var now = data || moment();
    var calendarData;
    if(calendarType === 'm'){
      calendarData = calendar.getMonthData(now);
    }else if(calendarType === 'w'){
      calendarData = calendar.getWeekData(now);
    }
    console.log(calendarData);
    return calendarData;
  },
  getMonthData:function(time){
    var monthStart = moment(time).startOf('month');
    var monthEnd = moment(time).endOf('month');
    var loopMoment = monthStart;
    var process = true;
    var monthWeeks = [];
    while(process){
      var weeks = calendar.getWeekData(loopMoment);
      monthWeeks.push({
        key:loopMoment.format('YYYY-W'),
        month:loopMoment.month(),
        weeks:weeks
      });
      loopMoment.add(7,"day");
      if(loopMoment.isSame(monthEnd,'day')||loopMoment.isAfter(monthEnd)){
        process = false;
      }
    }
    return monthWeeks;
  },
  getWeekData:function(time){
    var weekStart = moment(time).startOf('week');
    var weekEnd = moment(time).endOf('week');
    var loopMoment = weekStart;
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
      if(loopMoment.isSame(weekEnd,'day')||loopMoment.isAfter(weekEnd)){
        process=false;
      }else{
        loopMoment.add(1,'day');
      }
    }
    return weekDays;
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
