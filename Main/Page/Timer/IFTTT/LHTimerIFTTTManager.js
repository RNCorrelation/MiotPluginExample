/*
 * @Descripttion: 
 * @version: 
 * @Author: nicolas
 * @Date: 2019-09-03 15:51:36
 * @LastEditors: nicolas
 * @LastEditTime: 2019-09-12 16:56:10
 */
import Service from 'miot/Service';
import { Device } from 'miot';
import { LHTimeSpanUtils, LHCommonLocalizableString, LHDateUtils } from 'LHCommonFunction';
import { ChoiceDialog } from 'miot/ui/Dialog';
import PluginConfig from 'PluginConfig';
import LHLocalizedStrings from '../../../Localized/LHLocalizableString';
import LHIFTTTConfig from './LHIFTTTConfig';

export default class LHNightLightSceneManager {
  /**
   * 使能定时场景，执行一次的时间转成未来的时间，
   * 不然服务器会自动关闭 过去式的执行一次的定时。
   * @param timerScene
   * @param onSuccess
   * @param onFail
   * 如果是执行一次的过去式定时，再去关闭这个定时，时间原封不动。
   */

  static enableTimerScene(enable, timerScene, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    const {
      on_time: onTime,
      off_time: offTime,
      enable_timer_on: fromEnable,
      enable_timer_off: toEnable
    } = setting;
    const localTimer = LHTimeSpanUtils.getSceneTimerSpan(onTime, offTime, fromEnable, toEnable);
    const { timeSpan, fromDate, toDate } = localTimer;
    let { fromTime, toTime } = LHTimeSpanUtils.getTimeSlotToCloud(timeSpan, fromEnable, toEnable);

    if (!timeSpan.wday || timeSpan.wday.length === 0) {
      if (!enable) {
        if (fromEnable === '1' && toEnable === '1') {
          if (LHDateUtils.isBefore(fromDate) && LHDateUtils.isBefore(toDate)) {
            fromTime = onTime;
          }
        } else if (fromEnable === '0' && toEnable === '1' && LHDateUtils.isBefore(toDate)) {
          toTime = offTime;
        } else if (fromEnable === '1' && toEnable === '0' && LHDateUtils.isBefore(fromDate)) {
          fromTime = onTime;
        }
      }
    }

    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    scene = timerScene;
    if (typeof scene.save !== 'undefined') {
      scene.save({
        setting: {
          enable_timer: enable ? '1' : '0',
          enable_timer_off: timerScene.setting.enable_timer_off,
          enable_timer_on: timerScene.setting.enable_timer_on,
          off_method: timerScene.setting.off_method,
          off_param: timerScene.setting.off_param,
          on_method: timerScene.setting.on_method,
          on_param: timerScene.setting.on_param,
          on_time: String(fromTime),
          off_time: String(toTime),
          on_filter: timerScene.setting.on_filter,
          timer_type: timerScene.setting.timer_type
        }
      }).then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }

  static editClockTimerScene(timerScene, onParams, fromTime, toTime, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    if (timerScene.sceneID && timerScene.sceneID !== 0) {
      scene = timerScene;
    }
    if (typeof scene.save !== 'undefined') {
      scene.save({
        setting: {
          enable_timer: timerScene.setting.enable_timer,
          enable_timer_off: timerScene.setting.enable_timer_off,
          enable_timer_on: timerScene.setting.enable_timer_on,
          off_method: timerScene.setting.off_method,
          off_param: timerScene.setting.off_param,
          on_method: timerScene.setting.on_method,
          on_param: onParams,
          on_time: String(fromTime),
          off_time: String(toTime),
          on_filter: timerScene.setting.on_filter,
          timer_type: timerScene.setting.timer_type
        }
      }).then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }

  static editTimerScene(timerScene, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    if (timerScene.sceneID && timerScene.sceneID !== 0) {
      scene = timerScene;
    }
    if (typeof scene.save !== 'undefined') {
      scene.save().then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }

  static removeTimerScene(timerScene, onSuccess, onFail) {
    const { identify, name, setting } = timerScene;
    let scene = Service.scene.createTimerScene(Device.deviceID, {
      identify,
      name,
      setting
    });
    scene = timerScene;
    if (typeof scene.remove !== 'undefined') {
      scene.remove().then((saveRes) => {
        onSuccess(saveRes);
      }).catch((error) => {
        onFail(error);
      });
    } else {
      onFail('');
    }
  }

  static buildLazyClockTimer() {
    const setting = {
      enable_push: '1',
      enable_timer: '1',
      enable_timer_off: '0',
      enable_timer_on: '1',
      off_method: '',
      off_param: '',
      off_time: '0 0 * * 0,1,2,3,4,5,6',
      on_method: 'play_alarm_clock',
      on_param: ['on', '20', 50],
      on_time: '0 0 * * 0,1,2,3,4,5,6'
    };
    return setting;
  }

  static buildLazyClockTimerScene() {
    const lazyScene = Service.scene.createTimerScene(Device.deviceID, {
      identify: LHIFTTTConfig.LazyClockTimerIdentify,
      name: LHLocalizedStrings.mi_linuxHub_lazy_clock_name,
      setting: this.buildLazyClockTimer()
    });
    return lazyScene;
  }

  /**
   * 周期性定时数据：
   * @param choiceDialogVisible
   * @returns {*}
   */
  static getChoiceDialogData(choiceDialogVisible, timespan, filter) {
    const choiceArray = this.getChoiceArray(choiceDialogVisible, timespan.wday, filter);
    if (choiceDialogVisible === 1) {
      return {
        title: LHLocalizedStrings.mi_acpartner_repeat_timer_title,
        type: ChoiceDialog.TYPE.SINGLE,
        selectedIndexArray: choiceArray,
        options: [
          { title: LHCommonLocalizableString.common_repeat_once },
          { title: LHCommonLocalizableString.common_repeat_everyday },
          { title: LHCommonLocalizableString.common_date_workday },
          { title: LHCommonLocalizableString.common_date_weekend },
          { title: LHCommonLocalizableString.common_date_selfdefine }
        ]
      };
    } else {
      return {
        title: LHLocalizedStrings.mi_acpartner_repeat_self_timer_title,
        type: ChoiceDialog.TYPE.MULTIPLE,
        selectedIndexArray: choiceArray,
        options: [
          { title: LHCommonLocalizableString.common_short_date_mon },
          { title: LHCommonLocalizableString.common_short_date_tues },
          { title: LHCommonLocalizableString.common_short_date_wed },
          { title: LHCommonLocalizableString.common_short_date_thur },
          { title: LHCommonLocalizableString.common_short_date_fri },
          { title: LHCommonLocalizableString.common_short_date_sat },
          { title: LHCommonLocalizableString.common_short_date_sun }
        ]
      };
    }
  }

  static getRepeatFromPosition(position) {
    let filter;
    let wday = [];
    switch (position) {
      case 0:
        wday = [];
        break;
      case 1:
        wday = PluginConfig.EVERYDAY;
        break;
      /* case 2:
        wday = PluginConfig.EVERYDAY;
        filter = PluginConfig.FILTER_WORKDAY;
        break;
      case 3:
        wday = PluginConfig.EVERYDAY;
        filter = PluginConfig.FILTER_FREEDAY;
        break; */
      default:
    }
    return { wday, filter };
  }

  static getChoiceArray(choiceDialogVisible, wday, filter) {
    /* if (filter) {
      if (filter === PluginConfig.FILTER_WORKDAY) {
        return [2];
      } else if (filter === PluginConfig.FILTER_FREEDAY) {
        return [3];
      }
    } */
    console.log('getChoiceArray', choiceDialogVisible);
    if (choiceDialogVisible === 1) {
      if (wday === undefined || wday.length === 0) {
        return [0];
      } else if (this.arrayEquals(wday, PluginConfig.EVERYDAY)) {
        return [1];
      } else if (this.arrayEquals(wday, PluginConfig.WORKDAY)) {
        return [2];
      } else if (this.arrayEquals(wday, PluginConfig.WEEKDAY)) {
        return [3];
      } else {
        return [4];
      }
    } else {
      const wdayList = wday.map((value) => {
        return value === 0 ? 6 : value - 1;
      });
      return wdayList;
    }
  }

  /**
   * 更新周期定时显示文案。
   * @param timespan
   * @param filter
   * @returns {*}
   */
  static getPeriodStr(timespan, filter) {
    if (filter) {
      /* if (filter === PluginConfig.FILTER_WORKDAY) {
        return LHLocalizedStrings.mi_linuxHub_repeat_legal_workday;
      } else if (filter === PluginConfig.FILTER_FREEDAY) {
        return LHLocalizedStrings.mi_linuxHub_repeat_legal_weekday;
      } */
      return '';
    }
    const { wday } = timespan;
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
    } else if (this.arrayEquals(wday, PluginConfig.EVERYDAY)) {
      return LHCommonLocalizableString.common_repeat_everyday;
    } else if (this.arrayEquals(wday, PluginConfig.WORKDAY)) {
      return LHCommonLocalizableString.common_date_workday;
    } else if (this.arrayEquals(wday, PluginConfig.WEEKDAY)) {
      return LHCommonLocalizableString.common_date_weekend;
    } else {
      const wdays = wday.map((value) => { return days[value]; });
      return wdays.join(' ');
    }
  }

  static arrayEquals(array1, array2) {
    return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort());
  }

  /**
   * 获取当日时间
   */
  static todayComponents() {
    return new Date();
  }

  static tomorrowComonents() {
    return new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  }

  static yesterdayComonents() {
    return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  }

  static timerPrefixString(date, month) {
    let title = '';
    console.log(LHNightLightSceneManager.todayComponents().getDate());
    console.log(LHNightLightSceneManager.todayComponents().getMonth());
    if (LHNightLightSceneManager.todayComponents().getDate() === date
       && LHNightLightSceneManager.todayComponents().getMonth() === month) {
      title = '';
    }
    if (LHNightLightSceneManager.tomorrowComonents().getDate() === date
       && LHNightLightSceneManager.tomorrowComonents().getMonth() === month) {
      title = LHCommonLocalizableString.common_repeat_tomorrow;
    }
    if (LHNightLightSceneManager.yesterdayComonents().getDate() === date
       && LHNightLightSceneManager.yesterdayComonents().getMonth() === month) {
      title = LHCommonLocalizableString.common_log_yesterday;
    }
    return title;
  }

  /**
   * 输入时间是否比当前时间小，小就是超时了
   */
  static isTimePassed(year, month, date, hour, minute, second) {
    const currentDate = new Date();
    const targetDate = new Date();
    targetDate.setFullYear(year);
    targetDate.setMonth(month);
    targetDate.setDate(date);
    targetDate.setHours(hour);
    targetDate.setMinutes(minute);
    targetDate.setSeconds(second);
    return currentDate.getTime() > targetDate;
  }

  /**
   * 输入时间是否比当前时间小，小就是超时了
   */
  static isTimePassedByTime(time) {
    const currentDate = new Date();
    const targetDate = new Date(time);
    return currentDate.getTime() > targetDate.getTime();
  }

  /**
   * 获取当前的年份
   */
  static getYear() {
    return new Date().getYear();
  }

  /**
   * 开始时间是否过时
   */
  static isOnTimePass(onYear, onMonth, onDate, onHour, onMinute, onSecond) {
    let year = onYear;
    const month = onMonth;
    const date = onDate;
    const hour = onHour;
    const minute = onMinute;
    let second = onSecond;

    if (year <= 1900 || year >= 3000) {
      year = LHNightLightSceneManager.getYear();
    }

    if (second < -1 || second >= 60) {
      second = 0;
    }

    return LHNightLightSceneManager.isTimePassed(year, month, date, hour, minute, second);
  }

  /**
   * 结束时间是否过时
   */
  static isOffTimePass(offYear, offMonth, offDate, offHour, offMinute, offSecond) {
    let year = offYear;
    const month = offMonth;
    const date = offDate;
    const hour = offHour;
    const minute = offMinute;
    let second = offSecond;

    if (year <= 1900 || year >= 3000) {
      year = LHNightLightSceneManager.getYear();
    }

    if (second < -1 || second >= 60) {
      second = 0;
    }

    return LHNightLightSceneManager.isTimePassed(year, month, date, hour, minute, second);
  }

  /**
   * 判断输入的时刻是否在今天已经过去
   */
  static isMomentOfTodayPassed(hour, minute) {
    const todayDate = new Date();
    if ((hour < todayDate.getHours()) || ((hour === todayDate.getHours()) && (minute <= todayDate.getMinutes()))) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 判断开始或者结束时间是否需要显示‘明天’
   */
  static isTimeSetToTomorrow(onHour, onMinute) {
    return LHNightLightSceneManager.isMomentOfTodayPassed(onHour, onMinute);
  }

  /**
   * 判断两个timespan是否相等
   */
  static equalsAsTimespan(originTimespan, timespan) {
    console.log('equalsAsTimespan', originTimespan);
    if (originTimespan === undefined && timespan === undefined) {
      return true;
    } else if (originTimespan === undefined && timespan !== undefined) {
      return false;
    } else if (originTimespan !== undefined && timespan === undefined) {
      return false;
    } else {
      const { from, to, wday } = originTimespan;
      const { from: originFrom, to: originTo, wday: originWday } = timespan;
      if (wday) {
        wday.sort((a, b) => {
          return a - b;
        });
      }

      if (originWday) {
        originWday.sort((a, b) => {
          return a - b;
        });
      }
      console.log(originTimespan);
      if (JSON.stringify(from) === JSON.stringify(originFrom)
        && JSON.stringify(to) === JSON.stringify(originTo)
        && JSON.stringify(wday) === JSON.stringify(originWday)) {
        return true;
      }
      return false;
    }
  }
}