import PluginConfig from 'PluginConfig';
import ircontroller from 'miot/service/ircontroller';
import {
  LHMiServer, LHUserConfigsManager, LHDialogUtils, LHToastUtils, LHCommonLocalizableString
} from 'LHCommonFunction';
import { Device } from 'miot';
import { DeviceEventEmitter } from 'react-native';
import LHAcpartner from '../Model/LHAcPartner';

export default class LHAcCloudHost {
  /**
   * 获取品牌列表
   */
  static getBrands() {
    const promise = ircontroller.getBrands({ category: LHAcpartner.DEVICE_TYPE_AIR_CONDITIONER });
    return promise.then((response) => {
      if (response.code === 0) {
        console.log('获取品牌列表成功', response);
        return response.result.brands || [];
      } else {
        console.log('获取品牌列表失败', response);
        return (response);
      }
    }).catch((error) => {
      console.log('获取品牌列表失败', error);
      return (error);
    });
  }

  /**
   * 获取匹配树
   * @param brandId
   * @param onSuccess
   * @param onFail
   */
  static getMatchTree(brandId) {
    const AIR_CONDITIONER = LHAcpartner.DEVICE_TYPE_AIR_CONDITIONER;
    const URL = PluginConfig.MatchURL + 'category/' + AIR_CONDITIONER + '/brand/' + brandId;
    return fetch(URL, { method: 'GET' })
      .then((response) => { return response.json(); })
      .then((response) => {
        const { nodes } = response;
        console.log('获取某品牌某设备类型下的匹配遥控器ID成功', nodes);
        return (nodes);
      })
      .catch((error) => {
        console.log('️获取某品牌某设备类型下的匹配遥控器ID失败', error);
        throw error;
      });
  }

  /**
   * 获取品牌名称
   */
  static getBrandName(brandId) {
    return ircontroller.getIrCodeBrand({ brand_id: brandId }).then((res) => {
      if (res && res.result) {
        return LHAcpartner.isChina ? res.result.name : res.result.en_name;
      } else {
        throw res;
      }
    });
  }

  static loadUserConfigsDataAndGoPage(navigation, isBackPressed, showLoading) {
    LHMiServer.GetHostStorage(PluginConfig.ArtificialMatchIrLearnTime).then((result) => {
      console.log('loadUserConfigsData Storage ', result);
      if (result && Number(result) > 0) {
        if (navigation) {
          navigation.navigate('LHArtificialMatchingDonePage', { ir_learn_time: Number(result) });
        }
      } else {
        if (showLoading) LHDialogUtils.LoadingDialogShow();
        LHAcCloudHost.loadUserConfigsData(
          (res) => {
            console.log('getUserConfigsData res ', res);
            if (showLoading) LHDialogUtils.LoadingDialogHide();
            if (!showLoading) {
              if (navigation) {
                if (res && res.ir_learn_time > 0) {
                  navigation.navigate('LHArtificialMatchingDonePage', { ir_learn_time: res.ir_learn_time });
                } else {
                  navigation.navigate('LHUploadRemoteControlPage');
                }
              }
            } else {
              setTimeout(() => {
                let backPressed = false;
                if (typeof isBackPressed === 'function') {
                  backPressed = isBackPressed();
                } else {
                  backPressed = isBackPressed;
                }
                console.log('getUserConfigsData backPressed ', backPressed);
                if (!backPressed && navigation) {
                  if (res && res.ir_learn_time > 0) {
                    navigation.navigate('LHArtificialMatchingDonePage', { ir_learn_time: res.ir_learn_time });
                  } else {
                    navigation.navigate('LHUploadRemoteControlPage');
                  }
                }
              }, 700);
            }
          },
          (err) => {
            console.log('getUserConfigsData err ', err);
            if (showLoading) LHDialogUtils.LoadingDialogHide();
            LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
          }
        );
      }
    });
  }

  static loadUserConfigsData(onSuccess, onFail) {
    const key = LHUserConfigsManager.getUserConfigsKeyACPartnerV2();
    LHUserConfigsManager.getUserConfigsData(Device.deviceID, key, (res) => {
      if (res && res.ir_learn_time > 0) {
        LHMiServer.SetHostStorage(PluginConfig.ArtificialMatchIrLearnTime, res.ir_learn_time);
      }
      if (typeof onSuccess === 'function') onSuccess(res);
    }, onFail);
  }

  static setUserConfigsData(onSuccess, onFailed) {
    const key = LHUserConfigsManager.getUserConfigsKeyACPartnerV2();
    const mDate = new Date();
    const time = Math.round(mDate.getTime() / 1000);
    console.log('setUserConfigsData time ', time);
    LHUserConfigsManager.setUserConfigsData(Device.deviceID, key, { ir_learn_time: time },
      () => {
        console.log('setUserConfigsData Success ');
        DeviceEventEmitter.emit('updateTime', time);
        LHMiServer.SetHostStorage(PluginConfig.ArtificialMatchIrLearnTime, time);
        if (typeof onSuccess === 'function') onSuccess(time);
      },
      (err) => {
        console.log('setUserConfigsData err ', err);
        if (typeof onFailed === 'function') onFailed(err);
      });
  }
}
