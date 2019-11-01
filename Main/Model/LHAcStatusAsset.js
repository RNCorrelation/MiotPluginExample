import { LHCommonLocalizableString } from 'LHCommonFunction';
import LHAcStatus from './LHAcStatus';
import LHRemote from './LHRemote';
import Resources from '../../Resources';
import LHAcStatusCommand from '../Command/LHAcStatusCommand';
import LHLocalizableString from '../Localized/LHLocalizableString';

export default class LHAcStatusAsset {
  static acModeDespWithMode(mode) {
    const map = new Map([
      [0, LHLocalizableString.mi_acpartner_mode_cool], // 制冷
      [1, LHLocalizableString.mi_acpartner_mode_heat], // 制热
      [2, LHLocalizableString.mi_acpartner_mode_auto], // 自动
      [3, LHLocalizableString.mi_acpartner_mode_fan], // 送风
      [4, LHLocalizableString.mi_acpartner_mode_dry] // 除湿
    ]);
    return map.get(mode);
  }

  static acSpeedDespWithSpeed(speed) {
    const map = new Map([
      [0, LHLocalizableString.mi_acpartner_mode_auto], // 自动
      [1, LHLocalizableString.mi_acpartner_fanspeed_low], // 低速
      [2, LHLocalizableString.mi_acpartner_fanspeed_medium], // 中速
      [3, LHLocalizableString.mi_acpartner_fanspeed_high] // 高速
    ]);
    return map.get(speed);
  }

  static acSpeedLongDespWithSpeed(speed) {
    const map = new Map([
      [0, LHLocalizableString.mi_acpartner_fanspeed_with_auto], // 风速自动
      [1, LHLocalizableString.mi_acpartner_fanspeed_with_low], // 风速低
      [2, LHLocalizableString.mi_acpartner_fanspeed_with_medium], // 风速中
      [3, LHLocalizableString.mi_acpartner_fanspeed_with_high] // 风速高
    ]);
    return map.get(speed);
  }

  static acSpeedShortDespWithSpeed(speed) {
    const map = new Map([
      [0, LHLocalizableString.mi_acpartner_mode_auto], // 自动
      [1, LHCommonLocalizableString.common_voice_low], // 低
      [2, LHCommonLocalizableString.common_voice_middle], // 中
      [3, LHCommonLocalizableString.common_voice_high] // 高
    ]);
    return map.get(speed);
  }


  static acModeLongDespWithMode(mode) {
    const map = new Map([
      [0, LHLocalizableString.mi_acpartner_with_mode_cool],
      [1, LHLocalizableString.mi_acpartner_with_mode_heat],
      [2, LHLocalizableString.mi_acpartner_with_mode_auto],
      [3, LHLocalizableString.mi_acpartner_with_mode_fan],
      [4, LHLocalizableString.mi_acpartner_with_mode_dry]
    ]);
    return map.get(mode);
  }

  static acSwingDespWithSwing(swing) {
    const map = new Map([
      [0, LHCommonLocalizableString.common_on], // 开
      [1, LHCommonLocalizableString.common_off] // 关
    ]);
    return map.get(swing);
  }

  static acSwingLongDespWithSwing(swing) {
    const map = new Map([
      [0, LHLocalizableString.mi_acpartner_timer_workstate_wind_open], // 扫风开
      [1, LHLocalizableString.mi_acpartner_timer_workstate_wind_close] // 扫风关
    ]);
    return map.get(swing);
  }

  static acSpeedIconWithSpeed(speed) {
    const map = new Map([
      [0, { normal: Resources.homePageIcon.speedAuto, active: Resources.homePageIcon.speedAutoPress }],
      [1, { normal: Resources.homePageIcon.speedLow, active: Resources.homePageIcon.speedLowPress }],
      [2, { normal: Resources.homePageIcon.speedMedium, active: Resources.homePageIcon.speedMediumPress }],
      [3, { normal: Resources.homePageIcon.speedHigh, active: Resources.homePageIcon.speedHighPress }]
    ]);
    return map.get(speed);
  }

  static acModeIconWithMode(mode) {
    const map = new Map([
      [0, { normal: Resources.homePageIcon.modeCool, active: Resources.homePageIcon.modeCoolPress }],
      [1, { normal: Resources.homePageIcon.modeHeat, active: Resources.homePageIcon.modeHeatPress }],
      [2, { normal: Resources.homePageIcon.modeAuto, active: Resources.homePageIcon.modeAutoPress }],
      [3, { normal: Resources.homePageIcon.modeWind, active: Resources.homePageIcon.modeWindPress }],
      [4, { normal: Resources.homePageIcon.modeDry, active: Resources.homePageIcon.modeDryPress }]
    ]);
    return map.get(mode);
  }

  static acAcStatusDeaderDesp(status: LHAcStatus, remote: LHRemote) {
    const { modeState, swingState, windSpeed } = status;
    const arr = [];
    if (remote.judgeModeCanControl(modeState)) {
      arr.push(this.acModeDespWithMode(modeState));
    }
    if (remote.judgeWindDerectCanControl()) {
      arr.push(this.acSwingLongDespWithSwing(swingState));
    }
    if (remote.judgeSpeedCanControl(modeState, windSpeed)) {
      arr.push(this.acSpeedLongDespWithSpeed(windSpeed));
    }

    return arr.join(' | ');
  }

  static acModeDespWithStatus(status: LHAcStatus) {
    this.acModeDespWithMode(status.modeState);
  }

  /**
   * 匹配显示状态
   * @param command
   * @returns {string}
   */
  static acMatchDespWithStatus(command) {
    if (command && command.toLowerCase() === 'power_on') {
      return LHLocalizableString.mi_acpartner_power_on;
    } else if (command && command.toLowerCase() === 'power_off') {
      return LHLocalizableString.mi_acpartner_power_off;
    } else {
      const status:LHAcStatus = LHAcStatusCommand.parseStatusFromCommand(command);
      console.log(status);

      const {
        modeState, temperature, windSpeed, swingState
      } = status;
      let descr = '';
      descr += command.includes('M') ? this.acModeDespWithMode(modeState) + '/' : '';
      descr += command.includes('T') ? temperature + '℃/' : '';
      descr += command.includes('S') ? this.acSpeedDespWithSpeed(windSpeed) + '/' : '';
      descr += command.includes('D') ? this.acSwingLongDespWithSwing(swingState) + '/' : '';
      descr = descr.substr(0, descr.length - 1);
      return descr;
    }
  }
}
