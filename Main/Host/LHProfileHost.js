/* eslint-disable class-methods-use-this */
import { LHMiServer } from 'LHCommonFunction';
import { Device, DeviceEvent } from 'miot';
import LHAcStatusCommand from '../Command/LHAcStatusCommand';
import LHAcStatus from '../Model/LHAcStatus';
import PluginConfig from '../PluginConfig';
import LHCrcUtils from '../Utils/LHCrcUtils';

export default class LHProfileHost {
  /**
   * 进入匹配模式
   */
  enterMatch = () => {
    return LHMiServer.SendRPCPayload('set_prop', { match_state: 1 });
  };

  /**
   * 退出匹配模式
   */
  exitMatch = () => {
    return LHMiServer.SendRPCPayload('set_prop', { match_state: 0 }).then((res) => {
      return res;
    }).catch((error) => {
      throw error;
    });
  };

  /**
   * 更新空调匹配状态
   */
  setAcModel = (brandId, controllerId, acStatus) => {
    return LHMiServer.SendRPCPayload('set_ac_model', [brandId, controllerId, acStatus]).then((res) => {
      return res;
    }).catch((error) => {
      throw error;
    });
  }

  /**
   * 获取空调匹配状态
   */
  getAcModel = () => {
    return LHMiServer.SendRPCPayload('get_ac_model', [])
      .then((res) => {
        return res;
      });
  }

  /**
   * 获取空调匹配状态 cache, 返回 [controllerId, brandId]
   */
  restoreAcModelCache = () => {
    return LHMiServer.GetHostStorage(PluginConfig.ControllerIdBrandCacheKey);
  }

  /**
   * 保存空调匹配状态 cache
   */
  saveAcModelCache = (brandId, controllerId) => {
    return LHMiServer.SetHostStorage(PluginConfig.ControllerIdBrandCacheKey, [brandId, controllerId]);
  }

  /**
   * 开关指示灯 返回：0-开，1-关。
   */
  getPropEnNnlight = () => {
    return LHMiServer.SendRPCPayload('get_prop', ['en_nnlight']).then((res) => {
      if (res && res.result && res.result.length > 0) {
        return res.result[0] === 0;
      } else {
        throw res;
      }
    }).catch((error) => {
      throw error;
    });
  };

  /**
   * 开关指示灯，设置状态。
   */
  setPropEnNnlight = (value) => {
    return LHMiServer.SendRPCPayload('set_prop', { en_nnlight: value ? 0 : 1 }).then((res) => {
      return res;
    }).catch((error) => {
      throw error;
    });
  }

  /**
   * 工作模式
   * 0：表示空调模式且空调插头插在空调伴侣上
   * 1：表示空调模式且空调插头不插在空调伴侣上
   */
  getPropAcMode = () => {
    return LHMiServer.SendRPCPayload('get_prop', ['ac_mode']).then((res) => {
      if (res && res.result && res.result.length > 0) {
        return res.result[0];
      } else {
        throw res;
      }
    }).catch((error) => {
      throw error;
    });
  };

  /**
   * 工作模式 设置状态。
   */
  setPropAcMode = (value) => {
    return LHMiServer.SendRPCPayload('set_prop', { ac_mode: value });
  };

  /**
   * 安睡模式
   */

  getSleepFunc() {
    return LHMiServer.SendRPCPayload('get_sleep_func', []).then((res) => {
      if (res && res.result) {
        return res.result;
      } else {
        throw res;
      }
    });
  }


  setSleepFunc=(sleepFunc) => {
    return LHMiServer.SendRPCPayload('set_sleep_func', sleepFunc);
  }

  /**
   * 速冷
   */
  getQuickCool() {
    return LHMiServer.SendRPCPayload('get_quick_cool_func', []).then((res) => {
      if (res && res.result) {
        return res.result;
      } else {
        throw res;
      }
    });
  }

  setQuickCool(params) {
    return LHMiServer.SendRPCPayload('set_quick_cool_func', params);
  }

  // 获取设备属性
  getDeviceData() {
    const arr = ['ac_mode', 'ac_state', 'load_power', 'en_nnlight', 'quick_cool_state', 'sleep_state', 'list_crc32'];
    return LHMiServer.SendRPCPayload('get_prop', arr)
      .then((res) => {
        const { result } = res;
        if (!(Array.isArray(result) && result.length >= arr.length)) {
          throw new Error('Invalid return value of getDeviceData');
        }
        const workMode = Number(result[0]);
        const command = result[1];
        const power = Number(result[2]);
        const nightLight = result[3];
        const quickCoolState = Number(result[4]);
        const sleepState = Number(result[5]);
        const status:LHAcStatus = LHAcStatusCommand.parseStatusFromCommand(command);
        const listCrc32 = Number(result[6]);
        return {
          workMode, power, status, nightLight, quickCoolState, sleepState, listCrc32
        };
      });
  }

  // 获取设备状态
  restoreDeviceStatus() {
    return LHMiServer.GetHostStorage(PluginConfig.AcStatusCacheKey);
  }

  // 获取设备状态
  saveDeviceStatus(status) {
    return LHMiServer.SetHostStorage(PluginConfig.AcStatusCacheKey, status);
  }


  // MARK: 订阅 返回 {acState, power}
  setupDeviceSubscriptionWithCallback(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    this.msgSubscription = null;
    Device.getDeviceWifi().subscribeMessages('prop.ac_state', 'prop.load_power', 'prop.quick_cool_state', 'prop.sleep_state')
      .then((subcription) => {
        this.msgSubscription = subcription;
      });
    this.subscription = DeviceEvent.deviceReceivedMessages.addListener(
      (device, messages, originData) => {
        console.log('deviceReceivedMessages' + originData);
        let value = {};
        for (let i = 0; i < originData.length; i += 1) {
          const dataItem = originData[i];
          switch (dataItem.key) {
            case 'prop.ac_state':
              value = Object.assign({}, value, { acState: dataItem.value[0] });
              break;
            case 'prop.load_power':
              value = Object.assign({}, value, { power: dataItem.value[0] });
              break;
            case 'prop.quick_cool_state':
              value = Object.assign({}, value, { quickCoolState: dataItem.value[0] });
              break;
            case 'prop.sleep_state':
              value = Object.assign({}, value, { sleepState: dataItem.value[0] });
              break;
            default:
              break;
          }
          callback(value);
        }
      }
    );
  }

  removeDeviceSubscription() {
    if (this.subscription) {
      this.subscription.remove();
    }
    if (this.msgSubscription) {
      this.msgSubscription.remove();
    }
  }

  // MARK: 发送码库范围到固件
  setRemoteListCrc(controllerId, statusRemoteModel) {
    const arr = [controllerId, LHCrcUtils.getRemoteCrc32(controllerId, statusRemoteModel), statusRemoteModel];
    return LHMiServer.SendRPCPayload('send_list', arr);
  }
}
