/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-12 14:11:21
 * @LastEditors: nicolas
 * @LastEditTime: 2019-09-12 14:11:21
 */
/*
 * File: index.js
 * Project: PluginConfig
 * File Created: Tuesday, 20th August 2019 12:22:43 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import { CommonMethod } from 'LHCommonFunction';
import { Device } from 'miot';
import LHLocalizedStrings from '../Localized/LHLocalizableString';

export default class PluginConfig {
  /**
  * @static
  * @menber PluginVersion
  * @description 插件版本
  */
  static PluginVersion = '1.0.14';

  /**
   * 颜色
   * @type {string}
   */

  static MainColor = '#5FA7FE';

  static BrandSearchBgcolor = '#f0f0f0';

  static MainTextcolor = '#333333';

  static SelectBgColor = '#f3f3f3';

  static MainTextDetailcolor = '#999999';

  static DialogBgColor = 'rgba(0,0,0,0.5)';

  static Black80Color = 'rgba(0,0,0,0.8)';

  static btnTextColor = '#4C4C4C';

  static TransparentColor = 'rgba(0,0,0,0)';

  static PickerLineColor = 'rgba(255, 255, 255, 0.15';

  static EVERYDAY=[0, 1, 2, 3, 4, 5, 6];

  static WORKDAY= [1, 2, 3, 4, 5];

  static WEEKDAY= [0, 6];

  /**
  * @static
  * @menber TimeLightIdentify
  * @description Identify
  */
 static TimeIdentify= 'lumi_acpartner_timer'

 /**
  * @static
  * @menber TimeLightName
  * @description Name
  */
 static TimeName= Device.name + '-' + LHLocalizedStrings.mi_acpartner_timer_name;

  /**
   * 缓存:
   * 指示灯开关
   */
  static CloseLightCacheKey = CommonMethod.CreatCacheKey('CloseLight');

  /**
   * 工作模式
   */
  static WorkModeCacheKey = CommonMethod.CreatCacheKey('WorkMode');

  /**
   * 品牌ID
   */
  static BrandNameCacheKey = CommonMethod.CreatCacheKey('brandName');

  /**
   * 设置项
   */
  static SettingsCacheKey = CommonMethod.CreatCacheKey('SettingsCacheKey');

  /**
   * 遥控器ID
   */
  static ControllerIdBrandCacheKey = CommonMethod.CreatCacheKey('ControllerId_BrandId');

  static MatchURL = 'https://cdn.cnbj1.fds.api.mi-img.com/irservice/match/v2/';

  /**
  * @static
  * @menber kTIMER_AC_COUNTDOWN_ID
  * @description 延时关id
  */
  static AcCountDownId = 'lumi_acpartner_count_down_timer';

  /**
  * @static
  * @menber QuickCoolCacheKey
  * @description 速冷缓存key
  */
 static QuickCoolCacheKey = CommonMethod.CreatCacheKey('QuickCoolCacheKey');

 /**
   * 空调遥控器cache key
   */
  static AcRemoteModelCacheKey = 'AcRemoteModelCacheKey';

  /**
   * 空调状态cache key
   */
  static AcStatusCacheKey = CommonMethod.CreatCacheKey('AcStatusCacheKey');

  static ArtificialMatchIrLearnTime = CommonMethod.CreatCacheKey('irLearnTime');

  /**
   * 安睡模式 cache key
   */
  static SleepCacheKey = CommonMethod.CreatCacheKey('AcSleepCacheKey');

  /**
   * 品牌列表
   */
  static AcBrandListCacheKey = CommonMethod.CreatCacheKey('AcBrandListCacheKey');

  /**
   * 固件是否支持用RPC去控制有状态空调发码
   */
  static IsSupportRpcIRControl(firmwareVersion = Device.lastVersion) {
    return firmwareVersion > '2.0.6_0004';
  }
}
