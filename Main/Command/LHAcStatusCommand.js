/*
 * @Descripttion: 
 * @version: 
 * @Author: nicolas
 * @Date: 2019-10-14 11:37:58
 * @LastEditors: nicolas
 * @LastEditTime: 2019-10-14 11:37:58
 */
/*
 * File: LHAcStatusCommand.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 22nd August 2019 4:05:47 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import LHAcStatus from '../Model/LHAcStatus';
import LHRemote from '../Model/LHRemote';

export default class LHAcStatusCommand {
  /*
 *  控制红外码命令格式，不带电源状态，在空调开时使用
 */
  static commandFromStatus(status: LHAcStatus, remoteModel:LHRemote): string {
    const arr = [];
    // 模式
    if (remoteModel.judgeModeCanControl(status.modeState)) {
      arr.push('M' + status.modeState);
    }

    // 温度
    if (remoteModel.judgeTempCanControl(status.modeState, status.temperature)) {
      arr.push('T' + status.temperature);
    }

    // 风速
    if (remoteModel.judgeSpeedCanControl(status.modeState, status.windSpeed)) {
      arr.push('S' + status.windSpeed);
    }

    // 扫风
    if (remoteModel.judgeWindDerectCanControl()) {
      // 扫风开: swingState = 0
      arr.push(status.swingState ? 'D999' : 'D0');
    }

    return arr.join('_');
  }

  /*
 *  开关红外码的命令格式，比控制红外码命令格式多了电源状态，用作开关空调
 */
  static powerCommandFromStatus(status: LHAcStatus, remoteModel:LHRemote): string {
    const command = this.commandFromStatus(status, remoteModel);
    const arr = [];
    // 电源开为P0，电源关为P1
    arr.push('P' + Number(!status.powerState));
    if (command.length) {
      arr.push(command);
    }
    return arr.join('_');
  }

  /*
 *  新建个默认的空调状态，然后用命令码更新空调状态
 */
  static parseStatusFromCommand(command: string) : LHAcStatus {
    return this.updateStatusWithCommand(new LHAcStatus(), command);
  }

  /*
 *  用命令码更新空调状态
 */
  static updateStatusWithCommand(oldStatus: LHAcStatus, command: string) : LHAcStatus {
    const status = LHAcStatus.statusCopy(oldStatus);
    const parseCommandData = (key:String) => {
      const arr = command.split('_');
      const keyItem = arr.find((item) => {
        return item.startsWith(key);
      });
      if (keyItem === undefined) return null;
      const value = keyItem.substring(key.length);
      if (value === '') return null;
      return Number(value);
    };
    const powerState = parseCommandData('P');
    if (powerState !== null) {
      status.powerState = powerState ? 0 : 1;
    }
    const modeState = parseCommandData('M');
    if (modeState !== null) {
      status.modeState = modeState;
    }
    const temperature = parseCommandData('T');
    if (temperature !== null) {
      status.temperature = temperature;
    }
    const windSpeed = parseCommandData('S');
    if (windSpeed !== null) {
      status.windSpeed = windSpeed;
    }
    const swingState = parseCommandData('D');
    if (swingState !== null) {
      status.swingState = swingState > 0 ? 1 : 0;
      status.windDirection = swingState === 999 ? 0 : swingState;
    }
    return status;
  }
}
