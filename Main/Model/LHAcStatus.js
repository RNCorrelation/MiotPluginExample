/*
 * File: LHAcStatus.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 22nd August 2019 2:57:07 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import {
  CommonMethod
} from 'LHCommonFunction';

const defaultAcStatusProps = {
  powerState: 0, // 开关状态 0关 1开
  modeState: 0, // 模式
  temperature: 26, // 温度
  windDirection: 0, // 风向
  swingState: 0, // 风的状态（扫风／固定风）0开 1关
  windSpeed: 0, // 风速
  ledState: 0 // led  1 开  0 关
};

class LHAcStatus {
  constructor(props) {
    Object.assign(this, defaultAcStatusProps, props);
  }

  static statusCopy(status) {
    return CommonMethod.DeepClone(status);
  }
}

export default LHAcStatus;
