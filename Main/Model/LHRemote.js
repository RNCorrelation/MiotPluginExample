/*
 * File: LHRemote.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 19th September 2019 6:25:28 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { CommonMethod } from 'LHCommonFunction';

const KEY_MODES = 'modes';
const KEY_MODE = 'mode';
const KEY_SPEED = 'speeds';
const KEY_TEMPS = 'temps';
const KEY_SWING = 'swing';
const KEY_DIRECTS = 'directs';
const KEY_TYPE = 'type';


const defaultRemoteProps = {
  controllerId: 0,
  brandId: 0,
  remoteModel: null
};

class LHRemote {
  controllerId: number

  brandId: number

  remoteModel: any

  constructor(props) {
    Object.assign(this, defaultRemoteProps, props);
  }

  isStatusRemote() {
    const { remoteModel } = this;
    const models = remoteModel && remoteModel[KEY_MODES];
    return !!models;
  }

  /**
   *  获取空调的所有支持的模式
   */
  supportedModes() {
    let modes = [];
    const { remoteModel } = this;

    if (!remoteModel) return modes;
    const models = remoteModel[KEY_MODES];
    if (Array.isArray(models)) {
      modes = models.map((item) => {
        return item[KEY_MODE];
      });
    }
    return modes;
  }

  /**
   *  获取空调特定模式
   */
  modeDataWithMode(mode) {
    if (!this.isStatusRemote()) return undefined;
    const { remoteModel } = this;
    if (!remoteModel) return undefined;
    const models = remoteModel[KEY_MODES];
    const modes = this.supportedModes();
    const index = modes.indexOf(mode);
    return index !== -1 ? models[index] : undefined;
  }

  /**
   *  获取空调特定模式下所有支持的温度
   */
  supportedTempsWithMode(mode) {
    const modeData = this.modeDataWithMode(mode);
    return modeData && modeData[KEY_TEMPS];
  }

  /**
   *  获取空调特定模式下所有支持的温度，排序
   */
  sortedsupportedTempsWithMode(mode) {
    const arr = this.supportedTempsWithMode(mode);
    return arr && CommonMethod.DeepClone(arr).sort((a, b) => {
      return a - b;
    });
  }

  /**
   *  获取空调特定模式下所有支持的风速
   */
  supportedSpeedsWithMode(mode) {
    const modeData = this.modeDataWithMode(mode);
    return modeData && modeData[KEY_SPEED];
  }

  /**
   *  获取空调所有支持的风向
   */
  supportedSwingDirect() {
    const { remoteModel } = this;
    if (!remoteModel) return undefined;
    const swings = remoteModel[KEY_SWING];
    return swings && swings[KEY_DIRECTS];
  }

  /**
   *  获取下一个风向
   */
  findNextWindDirection(direction) {
    const arr = this.supportedSwingDirect();
    if (!(Array.isArray(arr) && arr.length)) return undefined;
    // eslint-disable-next-line eqeqeq
    const index = arr.findIndex((value) => { return value == direction; });
    if (index === -1) return arr[0];
    return arr[index + 1 >= arr.length ? 0 : index + 1];
  }

  /**
   *  获取空调支持的扫风模式 0：不支持扫风 1：定向风 2：扫风
   */
  supportedSwingType() {
    const { remoteModel } = this;
    if (!remoteModel) return undefined;
    const swings = remoteModel[KEY_SWING];
    return swings && (swings[KEY_TYPE] || 0);
  }

  /*
  *  判断“模式”指令是否可以操作
  *  传mode参数返回是否能调到mode模式，不传mode返回mode模式是否可以控制风速
  */
  judgeModeCanControl(mode = undefined) {
    const modes = this.supportedModes();
    if (mode !== undefined) {
      return Array.isArray(modes) && (modes.indexOf(mode) !== -1);
    } else {
      return Array.isArray(modes) && modes.length > 0;
    }
  }

  /*
  *  判断在特定模式下，“风速”指令是否可以操作
  *  传speed参数返回是否mode模式能调到speed风速，不传speed返回mode模式是否可以控制风速
  */
  judgeSpeedCanControl(mode, speed = undefined) {
    const speeds = this.supportedSpeedsWithMode(mode);
    if (speed !== undefined) {
      return Array.isArray(speeds) && (speeds.indexOf(speed) !== -1);
    } else {
      return Array.isArray(speeds) && speeds.length > 0;
    }
  }

  /*
  *  判断“扫风”、“风向”指令是否可以操作
  *  传direction参数返回是否能调到direction风向，不传direction返回是否可以控制扫风
  */
  judgeWindDerectCanControl(direction = undefined) {
    const directions = this.supportedSwingDirect();
    if (direction !== undefined) {
      return Array.isArray(directions) && (directions.indexOf(direction) !== -1);
    } else {
      return this.supportedSwingType() === 2;
    }
  }

  /*
  *  判断在特定模式下，“温度”指令是否可以操作
  *  传temp参数返回是否mode模式能调到temp温度，不传temp返回mode模式是否可以控制温度
  */
  judgeTempCanControl(mode, temp = undefined) {
    const temps = this.supportedTempsWithMode(mode);
    if (temp !== undefined) {
      return Array.isArray(temps) && (temps.indexOf(temp) !== -1);
    } else {
      return Array.isArray(temps) && temps.length > 0;
    }
  }

  /*
 *  找到相应的name的无状态按键
 */
  findKeyWithName(keyName) {
    const { keys } = this.remoteModel;
    let nameItem = null;
    if (Array.isArray(keys)) {
      nameItem = keys.find((element) => {
        const { name } = element;
        return name === keyName;
      });
    }
    return nameItem;
  }
}

export default LHRemote;
