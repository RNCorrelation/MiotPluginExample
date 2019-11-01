/*
 * File: LHIRRpcHost.js
 * Project: com.lumi.acparnter
 * File Created: Monday, 23rd September 2019 3:57:05 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { LHMiServer } from 'LHCommonFunction';

export default class LHIRRpcHost {
  /*
     *  设置空调模式
     */
  static setAcMode(value) {
    const map = new Map([
      [0, 'cool'], // 制冷
      [1, 'heat'], // 制热
      [2, 'auto'], // 自动
      [3, 'wind'], // 送风
      [4, 'dry'] // 除湿
    ]);
    const params = map.get(value);
    if (!params) return Promise.reject(new Error('Invalid setAcMode value input'));
    return LHMiServer.SendRPCPayload('set_mode', [params]);
  }

  /*
   *  设置空调的风速
   */
  static setACWindSpeed(value) {
    const map = new Map([
      [0, 'auto_fan'], // 风速自动
      [1, 'small_fan'], // 风速低
      [2, 'medium_fan'], // 风速中
      [3, 'large_fan'] // 风速高
    ]);
    const params = map.get(value);
    if (!params) return Promise.reject(new Error('Invalid setACWindSpeed value input'));
    return LHMiServer.SendRPCPayload('set_fan_level', [params]);
  }

  /*
   *  控制扫风
   */
  static setACSwing(value) {
    return LHMiServer.SendRPCPayload('set_ver_swing', [value ? 'on' : 'off']);
  }

  /*
   *  控制风向
   */
  // eslint-disable-next-line no-unused-vars
  static setACWindDirection(value) {
    // return LHMiServer.SendRPCPayload('set_ver_swing', [value + '']);
    // 固件做了循环遍历风向列表的处理
    return LHMiServer.SendRPCPayload('set_ver_swing', ['dir']);
  }

  /*
   *  修改温度
   */
  static setACTemperature(temperature) {
    return LHMiServer.SendRPCPayload('set_tar_temp', [Number(temperature)]);
  }

  /*
   *  控制开关
   */
  static setACPower(power) {
    return LHMiServer.SendRPCPayload('set_power', [power ? 'on' : 'off']);
  }
}
