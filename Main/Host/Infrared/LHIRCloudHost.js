/*
 * File: LHIRCloudHost.js
 * Project: com.lumi.acparnter
 * File Created: Monday, 23rd September 2019 3:56:38 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { Device } from 'miot';
import LHAcControl from '../../Model/LHAcControl';
import LHAcStatus from '../../Model/LHAcStatus';
import LHAcStatusCommand from '../../Command/LHAcStatusCommand';
import LHRemoteUtils from '../../Utils/LHRemoteUtils';

export default class LHIRCloudHost {
  /*
   *  设置空调模式
   */
  static setAcMode(mode, control: LHAcControl) {
    const { status } = control;
    const newStatus = LHAcStatus.statusCopy(status);
    newStatus.modeState = Number(mode);
    return this.sendStatusCommand(newStatus, control);
  }

  /*
 *  设置空调的风速
 */
  static setACWindSpeed(winds, control: LHAcControl) {
    const { status } = control;
    const newStatus = LHAcStatus.statusCopy(status);
    newStatus.windSpeed = Number(winds);
    return this.sendStatusCommand(newStatus, control);
  }

  /*
 *  控制扫风
 */
  static setACSwing(value, control: LHAcControl) {
    const { status } = control;
    const newStatus = LHAcStatus.statusCopy(status);
    newStatus.swingState = value ? 0 : 1;
    return this.sendStatusCommand(newStatus, control);
  }

  /*
 *  修改温度
 */
  static setACTemperature(temperature, control: LHAcControl) {
    const { status } = control;
    const newStatus = LHAcStatus.statusCopy(status);
    newStatus.temperature = Number(temperature);
    return this.sendStatusCommand(newStatus, control);
  }

  /*
 *  控制开关
 */
  static setACPower(power, control: LHAcControl) {
    const { status, remoteModel } = control;
    const newStatus = LHAcStatus.statusCopy(status);
    newStatus.powerState = power ? 1 : 0;
    return this.sendStatusCommand(newStatus, control, LHAcStatusCommand.powerCommandFromStatus(newStatus, remoteModel));
  }

  /*
   * 发送有状态命令, useCallback在请求之前会回调新status，请求失败后会回调旧status
   * cmd如果不传，默认用非开关码
   */
  static sendStatusCommand(status, control: LHAcControl, cmd = undefined) {
    const { remoteModel } = control;
    const { controllerId } = remoteModel;
    const command = cmd || LHAcStatusCommand.commandFromStatus(status, remoteModel);
    return LHRemoteUtils.sendStatusCommand(Device.deviceID, controllerId, command)
      .then((res) => {
        console.log('✅ success ' + command);
        return res;
      })
      .catch((err) => {
        console.log('❌ failure ' + command + JSON.stringify(err));
        throw err;
      });
  }
}
