/* eslint-disable camelcase */
/*
 * File: LHAcCommandSender.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 22nd August 2019 6:31:43 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import {
  Device
} from 'miot';
import LHAcStatusCommand from './LHAcStatusCommand';
import LHRemoteUtils from '../Utils/LHRemoteUtils';
import LHRemote from '../Model/LHRemote';
import LHAcControl from '../Model/LHAcControl';
import LHAcStatus from '../Model/LHAcStatus';
import {
  kNONE_AC_POWER_TOGGLE_KEY,
  kNONE_AC_MODE_KEY,
  kNONE_AC_TEMP_PLUS_KEY,
  kNONE_AC_TEMP_MINUS_KEY,
  kNONE_AC_WIND_SPEED_KEY,
  kNONE_AC_WIND_SWING_KEY
} from '../Model/LHAcDefine';


export default class LHAcCommandSender {
  // MARK: 有状态
  /*
   *  设置空调模式
   */
  static setAcMode(mode, control: LHAcControl) {
    return this.sendStatusCommand(control, (status) => {
      const statusTmp = LHAcStatus.statusCopy(status);
      statusTmp.modeState = mode;
      return statusTmp;
    });
  }

  /*
 *  设置空调的风速
 */
  static setACWindSpeed(winds, control: LHAcControl) {
    return this.sendStatusCommand(control, (status) => {
      const statusTmp = LHAcStatus.statusCopy(status);
      statusTmp.windSpeed = winds;
      return statusTmp;
    });
  }

  /*
 *  控制扫风
 */
  static setACSwing(value, control: LHAcControl) {
    let swing = value;
    if (typeof value !== 'number') {
      swing = value ? 0 : 1;
    }
    return this.sendStatusCommand(control, (status) => {
      const statusTmp = LHAcStatus.statusCopy(status);
      statusTmp.swingState = swing;
      return statusTmp;
    });
  }

  /*
 *  修改温度
 */
  static setACTemperature(temperature, control: LHAcControl) {
    return this.sendStatusCommand(control, (status) => {
      const statusTmp = LHAcStatus.statusCopy(status);
      statusTmp.temperature = temperature;
      return statusTmp;
    });
  }

  /*
 *  控制开关
 */
  static setACPower(power, control: LHAcControl) {
    const { status, remoteModel } = control;
    const { controllerId } = remoteModel;
    const newStatus = LHAcStatus.statusCopy(status);
    newStatus.powerState = power ? 1 : 0;
    const command = LHAcStatusCommand.powerCommandFromStatus(newStatus, remoteModel);
    return LHRemoteUtils.sendStatusCommand(Device.deviceID, controllerId, command)
      .then(() => {
        console.warn('✅success' + command);
        return newStatus;
      })
      .catch((err) => {
        console.warn('❌failure' + command + JSON.stringify(err));
        return status;
      });
  }

  static sendStatusCommand(control: LHAcControl, statusHandler) {
    const { status, remoteModel } = control;
    let newStatus = status;
    if (typeof statusHandler === 'function') {
      newStatus = statusHandler(newStatus);
    }
    const { controllerId } = remoteModel;
    const command = LHAcStatusCommand.commandFromStatus(newStatus, remoteModel);
    return LHRemoteUtils.sendStatusCommand(Device.deviceID, controllerId, command)
      .then(() => {
        console.warn('✅success' + command);
        return newStatus;
      })
      .catch((err) => {
        console.warn('❌failure' + command + JSON.stringify(err));
        return status;
      });
  }
}