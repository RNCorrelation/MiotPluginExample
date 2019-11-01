/*
 * File: LHAcPartner.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 22nd August 2019 2:53:46 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { LHMiServer } from 'LHCommonFunction';
import Host from 'miot/Host';
import LHAcStatusCommand from '../Command/LHAcStatusCommand';
import LHAcStatus from './LHAcStatus';

const nativeLanguage = Host.locale.language;

class LHAcPartner {
  static DEVICE_TYPE_AIR_CONDITIONER = 5;

  static ACPARTNER_MCN02_DEVICE_MODEL = 'lumi.acpartner.mcn02';

  static isChina = nativeLanguage === 'zh';

  /**
   * 工作模式
   * @type {number}
   */
  static AcWorkModeUnknown = -1;

  static AcWorkModeAC = 0;

  static AcWorkModeACNotPlug = 1;

  static AcWorkModeWaterHeater = 2;

  static AcWorkModeSocket = 3;

  /**
   * 空调有状态，无状态
   * @type {number}
   */
  static AcStateConditionNone = 0;

  static AcStateCondition = 1;

  /**
   * property
   */
  workMode = LHAcPartner.AcWorkModeUnknown;

  // 日电量
  todayElectricity = null;

  // 月电量
  monthElectricity = null;

  // 功率
  powerData = null;

  // 指示灯开关
  nightLight = 0;

  // 类型uint8_t     1：速冷中，0：不是速冷中       读/上报
  quickCoolState = 0;

  // 类型uint8_t     1：安睡中，0：不是安睡中       读/上报
  sleepState = 0;
}

export {
  LHAcPartner as default
};