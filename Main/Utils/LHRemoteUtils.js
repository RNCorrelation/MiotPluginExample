import { Component } from 'react';
import ircontroller from 'miot/service/ircontroller';
import { LHMiServer } from 'LHCommonFunction';
import PluginConfig from '../PluginConfig';

const fakeData = {
  modes: [{
    mode: 0,
    temps: [18, 19, 20, 26, 28, 29, 30],
    speeds: [0, 1, 2, 3]
  }, {
    mode: 1,
    temps: [25, 30, 31, 32],
    speeds: [0, 1, 2, 3]
  }, {
    mode: 2,
    speeds: [0, 1, 2, 3]
  }, {
    mode: 4
  }],
  swing: {
    type: 1,
    directs: [1, 2, 3]
  },
  keys: [{
    id: 1,
    name: 'POWER',
    display_name: '电源'
  }, {
    id: 2,
    name: 'MODE',
    display_name: '模式'
  }, {
    id: 22,
    name: 'SLEEP',
    display_name: '睡眠'
  }, {
    id: 23,
    name: 'TIMER',
    display_name: '定时'
  }, {
    id: 3,
    name: 'TEMP+',
    display_name: '温度+'
  }, {
    id: 4,
    name: 'TEMP-',
    display_name: '温度-'
  }, {
    id: 5,
    name: 'WIND_SPEED',
    display_name: '风量'
  }, {
    id: 9362,
    name: 'SWING',
    display_name: '摆风'
  }]
};

class LHRemoteUtils extends Component {
/**
 *  保存空调遥控器的缓存
 */
  static saveRemoteModelCache(controllerId, remoteModel) {
    return LHMiServer.SetHostStorage(PluginConfig.AcRemoteModelCacheKey + controllerId, remoteModel);
  }

  /**
 *  获取空调遥控器的缓存
 */
  static restoreRemoteModelCache(controllerId) {
    return LHMiServer.GetHostStorage(PluginConfig.AcRemoteModelCacheKey + controllerId);
  }

  /**
 *  获取空调遥控器数据
 */
  static fetchRemoteModel(controllerId) {
    return Promise.all([this.fetchRemoteStatusModel(controllerId), this.fetchRemoteNonStatusModel(controllerId)])
      .then((res) => {
        const [statusModel, nonStatusModel] = res;
        return Object.assign({}, statusModel, nonStatusModel);
      });
  }

  /**
 *  获取空调遥控器的所有支持的状态
 */
  static fetchRemoteStatusModel(controllerId) {
    return ircontroller.getIrCodeFunctions({ controller_id: controllerId })
      .then((res) => {
        const { result } = res;
        return result;
      });
  }

  /**
 *  获取空调遥控器的所有无状态按键
 */
  static fetchRemoteNonStatusModel(controllerId) {
    return ircontroller.getIrCodeKeys({ controller_id: controllerId })
      .then((res) => {
        const { result } = res;
        return result;
      });
  }

  static sendStatusCommand(did, controllerId, command) {
    if (!controllerId || !command) {
      return Promise.reject(new Error('invalid controller_id or command'));
    }

    return ircontroller.sendKey({ did, controller_id: controllerId, ac_key: command });
  }

  static sendNonStatusCommand(did, controllerId, keyId) {
    return ircontroller.sendKey({ did, controller_id: controllerId, key_id: keyId });
  }
}

export {
  LHRemoteUtils as default,
  fakeData
};
