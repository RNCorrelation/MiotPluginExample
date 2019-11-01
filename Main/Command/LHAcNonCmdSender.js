/*
 * File: LHAcNonCmdSender.js
 * Project: com.lumi.acparnter
 * File Created: Monday, 23rd September 2019 3:33:40 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
/* eslint-disable camelcase */

import {
  Device
} from 'miot';
import LHRemoteUtils from '../Utils/LHRemoteUtils';
import LHRemote from '../Model/LHRemote';
import {
  kNONE_AC_POWER_TOGGLE_KEY,
  kNONE_AC_MODE_KEY,
  kNONE_AC_TEMP_PLUS_KEY,
  kNONE_AC_TEMP_MINUS_KEY,
  kNONE_AC_WIND_SPEED_KEY,
  kNONE_AC_WIND_SWING_KEY
} from '../Model/LHAcDefine';


export default class LHAcNonCmdSender {
  // MARK: 无状态

  /*
 *  控制开关
 */
  static controlNonPower(remoteModel: LHRemote) {
    return this.sendNonCommandWithName(kNONE_AC_POWER_TOGGLE_KEY, remoteModel);
  }

  /*
*  控制温度+
*/
  static controlTempUp(remoteModel: LHRemote) {
    return this.sendNonCommandWithName(kNONE_AC_TEMP_PLUS_KEY, remoteModel);
  }

  /*
*  控制温度-
*/
  static controlTempDown(remoteModel: LHRemote) {
    return this.sendNonCommandWithName(kNONE_AC_TEMP_MINUS_KEY, remoteModel);
  }

  /*
*  控制无状态码 模式
*/
  static controlNonModel(remoteModel: LHRemote) {
    return this.sendNonCommandWithName(kNONE_AC_MODE_KEY, remoteModel);
  }

  /*
*  控制无状态码 风速
*/
  static controlNonWindSpeed(remoteModel: LHRemote) {
    return this.sendNonCommandWithName(kNONE_AC_WIND_SPEED_KEY, remoteModel);
  }

  /*
*  控制无状态码 扫风
*/
  static controlNonSwing(remoteModel: LHRemote) {
    return this.sendNonCommandWithName(kNONE_AC_WIND_SWING_KEY, remoteModel);
  }

  /*
 *  发送无状态命令 name
 */
  static sendNonCommandWithName(name: string, remoteModel: LHRemote) {
    const item = remoteModel.findKeyWithName(name);
    if (item === null) {
      return Promise.reject(new Error('No this key name in remote: ' + name));
    }
    const { id } = item;
    const { controllerId } = remoteModel;
    return this.sendNonStatusCommand(id, controllerId);
  }

  /*
 *  发送无状态命令 id
 */
  static sendNonCommandWithId(id: number, remoteModel: LHRemote) {
    const { controllerId } = remoteModel;
    return this.sendNonStatusCommand(id, controllerId);
  }

  static sendNonStatusCommand(keyId, controllerId) {
    return LHRemoteUtils.sendNonStatusCommand(Device.deviceID, controllerId, keyId);
  }
}