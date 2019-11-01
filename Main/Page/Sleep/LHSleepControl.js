/*
 * File Created: 2019-09-02 22:07
 * Author: 凌志文 (zhiwen.ling@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { LHCommonLocalizableString, LHDateUtils } from 'LHCommonFunction';
import LHAcStatusCommand from '../../Command/LHAcStatusCommand';
import LHAcStatus from '../../Model/LHAcStatus';

const SleepTimespan = {
  from: {
    hour: 23,
    min: 0
  },
  to: {
    hour: 7,
    min: 0
  },
  fromTime: 0,
  toTime: 0,
  wday: [1, 2, 3, 4, 5]
};
const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];

const WORKDAY = [1, 2, 3, 4, 5];

const WEEKDAY = [0, 6];

export default class LHSleepControl {
  /**
   * 安睡模式
   * <p>
   * 没有延时关闭的数据结构
   * [1,
   * ["0 23 * * 0,1,2,3,4,5,6","M0_T26_S1_D1"],
   * ["0 0 * * 0,1,2,3,4,5,6","M0_T28_S1_D1"],
   * ["0 6 * * 0,1,2,3,4,5,6","M0_T27_S1_D1"],
   * ["0 7 * * 0,1,2,3,4,5,6","M0_T26_S1_D1"]]
   * <p>
   * 有延时的数据结构
   * [1,
   * ["0 23 * * 1,2,3,4,5", "M0_T26_S1_D1"],
   * ["0 0 * * 2,3,4,5,6", "M0_T28_S1_D1"],
   * ["0 6 * * 2,3,4,5,6", "M0_T27_S1_D1"],
   * ["0 7 * * 2,3,4,5,6", "M0_T26_S1_D1"],
   * ["5 7 * * 2,3,4,5,6", "P1"]
   * ]
   *
   * 返回=》{
   * sleepStatus,
   * timeArray:['23:00','07:00'] & ['timestamp1','timestamp2']
   * timespan:{},
   * tempArray:[26,28,27,26],
   * delay:0
   * windSpeed:1,
   * swing:1}
   */
  static parseSleepFunc(res) {
    const sleepFunc = {
      sleepStatus: 0,
      timespan: {},
      delay: 0,
      tempArray: []
    };
    if (res && res.length >= 5) {
      sleepFunc.sleepStatus = res[0] || 0;
      if (res[1] && res[1].length === 2
        && res[2] && res[2].length === 2
        && res[3] && res[3].length === 2
        && res[4] && res[4].length === 2) {
        sleepFunc.timespan = LHSleepControl.parseSleepFuncTime(res[1][0], res[4][0]);
        const commandArray = [res[1][1], res[2][1], res[3][1], res[4][1]];
        commandArray.forEach((command) => {
          const status = LHAcStatusCommand.parseStatusFromCommand(command);
          sleepFunc.tempArray.push(status.temperature);
          if (command.includes('S')) {
            sleepFunc.windSpeed = status.windSpeed;
          }
          if (command.includes('D')) {
            sleepFunc.swing = status.swingState;
          }
        });
      }
      if (res.length === 6) {
        sleepFunc.delay = LHSleepControl.parseSleepFuncDelay(res[4][0], res[5][0]);
      }
    } else {
      sleepFunc.timespan = SleepTimespan;
      sleepFunc.tempArray.push(26);
      sleepFunc.tempArray.push(28);
      sleepFunc.tempArray.push(27);
      sleepFunc.tempArray.push(26);
    }
    console.log(sleepFunc);
    return sleepFunc;
  }

  static parseSleepFuncTime = (startTime, endTime) => {
    const regex1 = /\d{1,2}\s\d{1,2}\s\*\s\*\s[0-6]/;
    const regex2 = /^\d+(\.\d+)?$/;
    const timespan = Object.assign({}, SleepTimespan);
    if (regex1.test(startTime) && regex1.test(endTime)) {
      const fromArray = startTime.split(' ');
      const toArray = endTime.split(' ');
      timespan.from.min = Number(fromArray[0]);
      timespan.from.hour = Number(fromArray[1]);
      timespan.to.min = Number(toArray[0]);
      timespan.to.hour = Number(toArray[1]);
      timespan.wday = fromArray[4].split(',').map((value) => {
        return Number(value);
      });
    } else if (regex2.test(startTime) && regex2.test(endTime)) {
      timespan.fromTime = Number(startTime.slice(0, 10));
      timespan.toTime = Number(endTime.slice(0, 10));
      timespan.wday = [];
    }
    return timespan;
  };

  static parseSleepFuncDelay(endTime, delayTime) {
    const regex1 = /\d{1,2}\s\d{1,2}\s\*\s\*\s[0-6]/;
    const regex2 = /^\d+(\.\d+)?$/;
    if (regex1.test(delayTime) && regex1.test(endTime)) {
      const fromArray = endTime.split(' ');
      const toArray = delayTime.split(' ');
      const endMins = Number(fromArray[0]) + Number(fromArray[1]) * 60;
      const delayMins = Number(toArray[0]) + Number(toArray[1]) * 60;
      if (endMins < delayMins) {
        return Math.round(delayMins - endMins);
      } else {
        return Math.round(delayMins + 24 * 60 - endMins);
      }
    } else if (regex2.test(delayTime) && regex2.test(endTime)) {
      const endMins = Number(endTime);
      const delayMins = Number(delayTime);
      if (endMins < delayMins) {
        return Math.round(delayTime - endTime) / 60;
      } else {
        return Math.round(delayTime + 24 * 60 - endTime / 60);
      }
    }
    return 0;
  }

  /**
   * 构建安睡数组数据，用来保存给固件。
   */
  static buildSleepFunc = (sleepFunc, Remote) => {
    const {
      sleepStatus,
      timespan,
      delay,
      tempArray,
      windSpeed,
      swing
    } = sleepFunc;
    const data = [];
    try {
      if (sleepStatus === 0) {
        data.push(0);
      } else {
        data.push(1);
      }
      const acStatusArray = [];
      for (let i = 0; i < tempArray.length; i += 1) {
        const acStatus = new LHAcStatus();
        acStatus.modeState = 0;
        acStatus.temperature = tempArray[i];
        acStatus.windSpeed = windSpeed;
        acStatus.swingState = swing;
        const acCommond = LHAcStatusCommand.commandFromStatus(acStatus, Remote);
        acStatusArray.push(acCommond);
      }
      if (!timespan.wday || timespan.wday.length === 0) {
        data.push([String(timespan.fromTime), acStatusArray[0]]);
        data.push([String(timespan.fromTime + 360), acStatusArray[1]]);
        data.push([String(timespan.toTime - 360), acStatusArray[2]]);
        data.push([String(timespan.toTime), acStatusArray[3]]);
        if (delay > 0) {
          data.push([String(timespan.toTime + delay * 60), 'P1']);
        }
      } else {
        const mins = [];
        const hours = [];
        const wdays = [];
        mins.push(timespan.from.min);
        mins.push(timespan.from.min);
        mins.push(timespan.to.min);
        mins.push(timespan.to.min);

        hours.push(timespan.from.hour);
        hours.push((timespan.from.hour + 1) > 23 ? 0 : (timespan.from.hour + 1));
        hours.push((timespan.to.hour - 1) < 0 ? 23 : (timespan.to.hour - 1));
        hours.push(timespan.to.hour);

        wdays.push(timespan.wday.join(','));
        wdays.push(hours[1] < hours[0] ? LHSleepControl.addWday(timespan.wday).join(',') : timespan.wday.join(','));
        wdays.push(hours[2] < hours[0] ? LHSleepControl.addWday(timespan.wday).join(',') : timespan.wday.join(','));
        wdays.push(hours[3] < hours[0] ? LHSleepControl.addWday(timespan.wday).join(',') : timespan.wday.join(','));


        data.push([mins[0] + ' ' + hours[0] + ' * * ' + wdays[0], acStatusArray[0]]);
        data.push([mins[1] + ' ' + hours[1] + ' * * ' + wdays[1], acStatusArray[1]]);
        data.push([mins[2] + ' ' + hours[2] + ' * * ' + wdays[2], acStatusArray[2]]);
        data.push([mins[3] + ' ' + hours[3] + ' * * ' + wdays[3], acStatusArray[3]]);
        if (delay > 0) {
          const delayMins = timespan.to.hour * 60 + timespan.to.min + delay;
          if (delayMins > 24 * 60 - 1) {
            const delayHour = Math.floor((delayMins - 24 * 60) / 60 - 1);
            const delayMin = Math.floor((delayMins - 24 * 60) % 60);
            const delayWday = LHSleepControl.addWday(wdays[3]);
            data.push([delayMin + ' ' + delayHour + ' * * ' + delayWday, 'P1']);
          } else {
            const delayHour = Math.floor(delayMins / 60);
            const delayMin = Math.floor(delayMins % 60);
            const delayWday = wdays[3];
            data.push([delayMin + ' ' + delayHour + ' * * ' + delayWday, 'P1']);
          }
        }
      }
    } catch (e) {
      return [];
    }
    return data;
  };

  static addWday = (wday) => {
    const wdayPlus = wday.map((value) => {
      return value === 6 ? 0 : value + 1;
    });

    wdayPlus.sort((a, b) => {
      return a - b;
    });
    return wdayPlus;
  };

  static DescOfPeroid = (timespan) => {
    const {
      from, to, fromTime, toTime, wday
    } = timespan;
    const timerArray = ['23:00', '07:00'];
    const peroid = LHSleepControl.DescOfWday(wday);
    let timer = timerArray[0] + '-' + timerArray[1];
    if (wday && wday.length > 0) {
      timerArray[0] = ('0' + from.hour).slice(-2) + ':' + ('0' + from.min).slice(-2);
      timerArray[1] = ('0' + to.hour).slice(-2) + ':' + ('0' + to.min).slice(-2);
      timer = timerArray[0] + '-' + timerArray[1];
    } else if (fromTime && toTime) {
      const fromDate = new Date(fromTime * 1000);
      const toDate = new Date(toTime * 1000);
      timerArray[0] = ('0' + fromDate.getHours()).slice(-2) + ':' + ('0' + fromDate.getMinutes()).slice(-2);
      timerArray[1] = ('0' + toDate.getHours()).slice(-2) + ':' + ('0' + toDate.getMinutes()).slice(-2);
      if (LHDateUtils.isYesterday(fromDate)) {
        timer = LHCommonLocalizableString.common_log_yesterday + timerArray[0] + '-' + timerArray[1];
      } else if (LHDateUtils.isToday(fromDate) && LHDateUtils.isTomorrow(toDate)) {
        timer = timerArray[0] + '-' + LHCommonLocalizableString.common_repeat_tomorrow + timerArray[1];
      } else if (LHDateUtils.isTomorrow(fromDate) && LHDateUtils.isTomorrow(toDate)) {
        timer = LHCommonLocalizableString.common_repeat_tomorrow + timerArray[0] + '-' + timerArray[1];
      } else {
        timer = timerArray[0] + '-' + timerArray[1];
      }
    }
    return peroid + ' ' + timer;
  }

  static peroidArray = (timespan) => {
    const data = [];
    const {
      from, to, fromTime, toTime, wday
    } = timespan;
    if (!from && !fromTime) {
      return ['23:00', '00:00', '06:00', '07:00'];
    }
    console.log(timespan);
    if (!wday || wday.length === 0) {
      const fromDate = new Date(fromTime * 1000);
      const fromDate2 = new Date(fromTime * 1000 + 3600000);
      const toDate = new Date(toTime * 1000 - 3600000);
      const toDate2 = new Date(toTime * 1000);
      console.log(fromDate);
      data.push(('0' + fromDate.getHours()).slice(-2) + ':' + ('0' + fromDate.getMinutes()).slice(-2));
      data.push(('0' + fromDate2.getHours()).slice(-2) + ':' + ('0' + fromDate2.getMinutes()).slice(-2));
      data.push(('0' + toDate.getHours()).slice(-2) + ':' + ('0' + toDate.getMinutes()).slice(-2));
      data.push(('0' + toDate2.getHours()).slice(-2) + ':' + ('0' + toDate2.getMinutes()).slice(-2));
    } else {
      const mins = [];
      const hours = [];
      mins.push(from.min);
      mins.push(from.min);
      mins.push(to.min);
      mins.push(to.min);

      hours.push(from.hour);
      hours.push((from.hour + 1) > 23 ? 0 : (from.hour + 1));
      hours.push((to.hour - 1) < 0 ? 23 : (to.hour - 1));
      hours.push(to.hour);
      data.push(('0' + hours[0]).slice(-2) + ':' + ('0' + mins[0]).slice(-2));
      data.push(('0' + hours[1]).slice(-2) + ':' + ('0' + mins[1]).slice(-2));
      data.push(('0' + hours[2]).slice(-2) + ':' + ('0' + mins[2]).slice(-2));
      data.push(('0' + hours[3]).slice(-2) + ':' + ('0' + mins[3]).slice(-2));
    }
    console.log(data);
    return data;
  };

  static DescOfWday = (wday) => {
    const days = [
      LHCommonLocalizableString.common_short_date_sun,
      LHCommonLocalizableString.common_short_date_mon,
      LHCommonLocalizableString.common_short_date_tues,
      LHCommonLocalizableString.common_short_date_wed,
      LHCommonLocalizableString.common_short_date_thur,
      LHCommonLocalizableString.common_short_date_fri,
      LHCommonLocalizableString.common_short_date_sat
    ];
    if (wday === undefined || wday.length === 0) {
      return LHCommonLocalizableString.common_repeat_once;
    } else if (LHSleepControl.arrayEquals(wday, EVERYDAY)) {
      return LHCommonLocalizableString.common_repeat_everyday;
    } else if (LHSleepControl.arrayEquals(wday, WORKDAY)) {
      return LHCommonLocalizableString.common_date_workday;
    } else if (LHSleepControl.arrayEquals(wday, WEEKDAY)) {
      return LHCommonLocalizableString.common_date_weekend;
    } else {
      const wdays = wday.map((value) => { return days[value]; });
      return wdays.join(' ');
    }
  };

  static getSleepPeroidArray = (timespan) => {
    const {
      from, to, fromTime, toTime, wday
    } = timespan;
    let startTime = [];
    let endTime = [];
    let startTimeStr = [];
    let endTimeStr = [];
    if (wday && wday.length > 0) {
      startTime = [from.hour, from.min];
      endTime = [to.hour, to.min];
      startTimeStr = ('0' + from.hour).slice(-2) + ':' + ('0' + from.min).slice(-2);
      endTimeStr = ('0' + to.hour).slice(-2) + ':' + ('0' + to.min).slice(-2);
    } else if (fromTime && toTime) {
      const fromDate = new Date(fromTime * 1000);
      const toDate = new Date(toTime * 1000);
      startTime = [fromDate.getHours(), fromDate.getMinutes()];
      endTime = [toDate.getHours(), toDate.getMinutes()];
      startTimeStr = ('0' + fromDate.getHours()).slice(-2) + ':' + ('0' + fromDate.getMinutes()).slice(-2);
      endTimeStr = ('0' + toDate.getHours()).slice(-2) + ':' + ('0' + toDate.getMinutes()).slice(-2);
    }
    return {
      startTime, endTime, startTimeStr, endTimeStr
    };
  };

  static IndexOfWday = (wday) => {
    if (!wday || wday.length === 0) {
      return 0;
    } else if (LHSleepControl.arrayEquals(wday, EVERYDAY)) {
      return 1;
    } else if (LHSleepControl.arrayEquals(wday, WORKDAY)) {
      return 2;
    } else if (LHSleepControl.arrayEquals(wday, WEEKDAY)) {
      return 3;
    } else {
      return 4;
    }
  };

  static wdayOfIndex = (index) => {
    if (index === 0) {
      return [];
    } else if (index === 1) {
      return EVERYDAY;
    } else if (index === 2) {
      return WORKDAY;
    } else if (index === 3) {
      return WEEKDAY;
    }
    return [];
  };


  static arrayEquals(array1, array2) {
    if (array1.length === 0 && array2.length === 0) {
      return true;
    }
    return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort());
  }

  /**
   * 判断两个timespan是否相等
   */
  static equalsAsTimespan(originTimespan, timespan) {
    const { from, to, wday } = originTimespan;
    const { from: originFrom, to: originTo, wday: originWday } = timespan;
    console.log(originTimespan);
    if (JSON.stringify(from) === JSON.stringify(originFrom)
      && JSON.stringify(to) === JSON.stringify(originTo)
      && JSON.stringify(wday) === JSON.stringify(originWday)) {
      return true;
    }
    return false;
  }

  static equalsAsSleepFun(originSleepFunc, currentSleepFunc) {
    const {
      sleepStatus: originSleepStatus, timespan: originTimespan, delay: originDelay, tempArray: originTempArray, windSpeed: originWindSpeed, swing: originSwing
    } = originSleepFunc;
    const {
      sleepStatus: currentSleepStatus, timespan: currentTimespan, delay: currentDelay, tempArray: currentTempArray, windSpeed: currentWindSpeed, swing: currentSwing
    } = currentSleepFunc;
    if (originSleepStatus === currentSleepStatus && currentSleepStatus === 0) {
      return true;
    }
    if (originSleepStatus === currentSleepStatus
      && this.equalsAsTimespan(originTimespan, currentTimespan)
      && originDelay === currentDelay
      && JSON.stringify(originTempArray) === JSON.stringify(currentTempArray)
      && originWindSpeed === currentWindSpeed
      && originSwing === currentSwing) {
      return true;
    }
    return false;
  }
}