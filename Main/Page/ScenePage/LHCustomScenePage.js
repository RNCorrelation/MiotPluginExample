/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-06 18:18:42
 * @LastEditors: nicolas
 * @LastEditTime: 2019-10-16 17:04:58
 */
import React from 'react';
import { View } from 'react-native';
import {
  LHTitleBarCustom, LHStandardListSwipeout
} from 'LHCommonUI';
import { LHCommonLocalizableString, LHToastUtils } from 'LHCommonFunction';
import {
  Device, Package
} from 'miot';
import ChoiceDialog from 'miot/ui/Dialog/ChoiceDialog';
import AbstractDialog from 'miot/ui/Dialog/AbstractDialog';
import PluginConfig from 'PluginConfig';
import StringSpinner from 'miot/ui/StringSpinner';
import LHAcStatusCommand from '../../Command/LHAcStatusCommand';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';
import LHCommonStyle from '../../Styles/LHCommonStyle';
import LHAcStatusAsset from '../../Model/LHAcStatusAsset';
import LHRemoteUtils from '../../Utils/LHRemoteUtils';
import LHRemote from '../../Model/LHRemote';
import LHRpcHost from '../../Host/LHRpcHost';
import Resources from '../../../Resources';

let Instance = null;
class LHCustomScenePage extends React.Component {
  static navigationOptions = () => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={Device.name}
            style={[LHCommonStyle.navigatorWithBorderBotoom]}
            rightButtons={[{
              type: 'deafultCompleteBtn',
              press: () => {
                Instance.save();
              }
            }]}
            leftButtons={[{
              type: 'deafultCloseBtn',
              press: () => {
                Instance.back();
              }
            }]}
          />
        </View>
      )
    };
  }

  constructor(prop) {
    super(prop);
    this.status = Package.entryInfo.payload.value;
    if (!this.status) {
      this.status = 'M0_T26_S0_D0';
    }
    this.status = 'P1_' + this.status;

    Instance = this;
    this.state = ({
      acStatus: LHAcStatusCommand.parseStatusFromCommand(this.status),
      isShowModeView: false,
      isShowTempView: false,
      isShowSpeedView: false,
      isShowWindDirectView: false
    });
  }

  componentWillMount() {
    this.getDeviceModel();
  }

  getDeviceModel() {
    const { acStatus } = this.state;
    const parseIds = (result) => {
      if (Array.isArray(result) && result.length >= 2) {
        const brandId = Number(result[0]);
        const controllerId = Number(result[1]);
        return { controllerId, brandId };
      } else {
        throw new Error('get_ac_model invalid return value' + result);
      }
    };

    // getRemoteModel 有可能调用云端，所以local的AcModel和remote的AcModel调用的getRemoteModel返回顺序不确定
    // 有可能 local的AcModel的getRemoteModel 比 remote的AcModel的getRemoteModel 慢

    // locally
    LHRpcHost.restoreAcModelCache()
      .then((result) => {
        return parseIds(result);
      })
      .then((res) => {
        const { controllerId, brandId } = res;
        // 获取并更新controllerId的remote
        this.getRemoteModel(controllerId)
          .then((remoteModel) => {
            const newRemote = new LHRemote({ brandId, controllerId, remoteModel });
            this.setState({
              Remote: newRemote
            });
          });
      });

    // remotely
    LHRpcHost.getAcModel()
      .then((res) => {
        const { result } = res;
        return parseIds(result);
      })
      .then((res) => {
        const { controllerId, brandId } = res;
        LHRpcHost.saveAcModelCache(brandId, controllerId);
        return res;
      })
      .then((res) => {
        const { controllerId, brandId } = res;
        this.getRemoteModel(controllerId)
          .then((remoteModel) => {
            const newRemote = new LHRemote({ brandId, controllerId, remoteModel });
            if (!newRemote.isStatusRemote()) {
              LHToastUtils.showShortToast(LHLocalizedStrings.mi_acpartnar_no_state);
            } else if (newRemote.judgeTempCanControl(acStatus.modeState)) {
              const supportedTemps = newRemote.supportedTempsWithMode(acStatus.modeState);
              const MIN_TEMP = Math.min(...supportedTemps);
              const MAX_TEMP = Math.max(...supportedTemps);
              if (acStatus.temperature > MAX_TEMP) {
                acStatus.temperature = MAX_TEMP;
              }
              if (acStatus.temperature < MIN_TEMP) {
                acStatus.temperature = MIN_TEMP;
              }
            }
            this.setState({
              Remote: newRemote
            });
          }).catch((err) => {
            throw err;
          });
      })
      .catch(() => {
        // 失败就toast一下
        LHToastUtils.showShortToast(LHCommonLocalizableString.common_tips_loading_failed);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  getRemoteModel(controllerId) {
    if (!controllerId) return Promise.resolve(null);

    // 先获取缓存，如果缓存没有就用云端，如果有缓存了就用缓存并更新缓存
    // cache
    const promiseLocal = new Promise((resolve) => {
      LHRemoteUtils.restoreRemoteModelCache(controllerId)
        .then((remoteModel) => {
          if (remoteModel) {
            resolve(remoteModel);
          }
        });
    });

    // remote
    const PromiseRemote = LHRemoteUtils.fetchRemoteModel(controllerId)
      .then((remoteModel) => {
        if (!remoteModel) throw new Error('invalid fetchRemoteModel data');
        LHRemoteUtils.saveRemoteModelCache(controllerId, remoteModel);
        return remoteModel;
      });

    return Promise.race([promiseLocal, PromiseRemote]);
  }

  getData() {
    const { acStatus, Remote } = this.state;
    const datas = [];
    if (!Remote) {
      return [{ data: datas }];
    }
    if (!Remote.isStatusRemote()) {
      return [{ data: datas }];
    }
    if (Remote.judgeModeCanControl()) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_mode,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: LHAcStatusAsset.acModeDespWithMode(acStatus.modeState),
        press: () => {
          this.setState({
            isShowModeView: true
          });
        }
      };
      datas.push(data);
    }
    if (Remote.judgeTempCanControl(acStatus.modeState)) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_timer_temperature,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: acStatus.temperature + '℃',
        press: () => {
          this.setState({
            isShowTempView: true
          });
        }
      };
      datas.push(data);
    }
    if (Remote.judgeSpeedCanControl(acStatus.modeState)) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_fanspeed,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: LHAcStatusAsset.acSpeedDespWithSpeed(acStatus.windSpeed),
        press: () => {
          this.setState({
            isShowSpeedView: true
          });
        }
      };
      datas.push(data);
    }
    if (Remote.judgeWindDerectCanControl()) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_airswing,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: LHAcStatusAsset.acSwingDespWithSwing(acStatus.swingState),
        press: () => {
          this.setState({
            isShowWindDirectView: true
          });
        }
      };
      datas.push(data);
    }
    return [{ data: datas }];
  }

  getModeList() {
    const { Remote } = this.state;
    if (!Remote) {
      return [];
    }
    const modesArr = Remote.supportedModes();
    const datas = [];
    if (modesArr) {
      modesArr.forEach((item) => {
        const data = {
          title: LHAcStatusAsset.acModeDespWithMode(item)
        };
        datas.push(data);
      });
    }
    return datas;
  }

  getSpeedList(mode) {
    const { Remote } = this.state;
    if (!Remote) {
      return [];
    }
    let speedArr = Remote.supportedSpeedsWithMode(mode);
    const datas = [];
    if (speedArr) {
      speedArr = this.getTagetSpeedArr(speedArr);
      speedArr.forEach((item) => {
        const data = {
          title: LHAcStatusAsset.acSpeedDespWithSpeed(item)
        };
        datas.push(data);
      });
    }
    return datas;
  }

  getTagetSpeedArr(speedArr) {
    const { Remote } = this.props;
    const tagetArr = [];
    if (speedArr.indexOf(0) !== -1) {
      tagetArr.push(0);
    }
    for (let i = 3; i > 0; i -= 1) {
      if (speedArr.indexOf(i) !== -1) {
        tagetArr.push(i);
      }
    }
    return tagetArr;
  }

  getWindDirectList() {
    const { acStatus, Remote } = this.state;
    const datas = [{ title: LHCommonLocalizableString.common_on }, { title: LHCommonLocalizableString.common_off }];
    return datas;
  }

  save() {
    const { acStatus, Remote } = this.state;
    if (!Remote) {
      return;
    }
    Package.entryInfo.payload.value = LHAcStatusCommand.powerCommandFromStatus(acStatus, Remote).substring(3);
    Package.exit(Package.entryInfo);
  }

  back() {
    const { acStatus, Remote } = this.state;
    Package.exit();
  }

  render() {
    const { acStatus, Remote } = this.state;
    const {
      isShowModeView, isShowTempView, isShowSpeedView, isShowWindDirectView
    } = this.state;
    this.temp = acStatus.temperature;
    const modeSupportArr = Remote ? (Remote.supportedModes() ? Remote.supportedModes() : []) : [];
    const tempSupportArr = Remote ? (Remote.sortedsupportedTempsWithMode(acStatus.modeState, Remote) ? Remote.sortedsupportedTempsWithMode(acStatus.modeState, Remote) : []) : [];
    let speedSupportArr = Remote ? (Remote.supportedSpeedsWithMode(acStatus.modeState) ? Remote.supportedSpeedsWithMode(acStatus.modeState) : []) : [];
    const modeSelecedIndex = modeSupportArr.indexOf(acStatus.modeState);
    if (modeSelecedIndex === -1) {
      if (modeSupportArr.length !== 0) {
        acStatus.modeState = modeSupportArr[0];
        this.setState({
          acStatus
        });
      }
    }
    const tempSelecedIndex = tempSupportArr.indexOf(acStatus.temperature);
    if (tempSelecedIndex === -1) {
      if (tempSupportArr.length !== 0) {
        acStatus.temperature = tempSupportArr[0];
        this.setState({
          acStatus
        });
      }
    }
    speedSupportArr = this.getTagetSpeedArr(speedSupportArr);
    const speedSelecedIndex = speedSupportArr.indexOf(acStatus.windSpeed);
    if (speedSelecedIndex === -1) {
      if (speedSupportArr.length !== 0) {
        acStatus.windSpeed = speedSupportArr[0];
        this.setState({
          acStatus
        });
      }
    }

    const actionSheetModeView = (
      <ChoiceDialog
        title={LHLocalizedStrings.mi_acpartner_mode}
        type={ChoiceDialog.TYPE.SINGLE}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        visible={isShowModeView}
        options={this.getModeList()}
        onSelect={(item) => {
          acStatus.modeState = modeSupportArr.length >= item[0] ? modeSupportArr[item[0]] : 0;
          this.setState({
            acStatus
          });
        }}
        selectedIndexArray={[modeSelecedIndex]}
        onDismiss={() => {
          this.setState({
            isShowModeView: false
          });
        }}
      />
    );

    const actionSheetTempView = (
      <AbstractDialog
        title={LHLocalizedStrings.mi_acpartner_timer_temperature}
        visible={isShowTempView}
        onDismiss={() => {
          this.setState({
            isShowTempView: false
          });
        }}
        buttons={[{
          text: LHCommonLocalizableString.common_ok,
          callback: () => {
            if (this.temp !== acStatus.temperature) {
              acStatus.temperature = this.temp;
            }
            this.setState({
              acStatus,
              isShowTempView: false
            });
          }
        }]}
      >
        <StringSpinner
          style={{ marginHorizontal: 0, height: 200 }}
          unit="℃"
          dataSource={tempSupportArr.map((item) => {
            return item + '';
          })}
          pickerInnerStyle={{
            selectTextColor: PluginConfig.MainColor,
            unitTextColor: PluginConfig.MainColor
          }}
          defaultValue={acStatus.temperature + ''}
          onValueChanged={(data) => {
            this.temp = Number(data.newValue);
          }}
        />
      </AbstractDialog>
    );
    const actionSheetSpeedView = (
      <ChoiceDialog
        title={LHLocalizedStrings.mi_acpartner_fanspeed}
        visible={isShowSpeedView}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        options={this.getSpeedList(acStatus.modeState)}
        selectedIndexArray={[speedSelecedIndex]}
        onSelect={(res) => {
          acStatus.windSpeed = speedSupportArr.length >= res[0] ? speedSupportArr[res[0]] : 0;
          this.setState({
            acStatus
          });
        }}
        onDismiss={() => {
          this.setState({
            isShowSpeedView: false
          });
        }}
      />
    );

    const actionSheetWindDirectView = (
      <ChoiceDialog
        title={LHLocalizedStrings.mi_acpartner_airswing}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        visible={isShowWindDirectView}
        options={this.getWindDirectList()}
        selectedIndexArray={[acStatus.swingState]}
        onSelect={(res) => {
          acStatus.swingState = res[0];
          this.setState({
            acStatus
          });
        }}
        onDismiss={() => {
          this.setState({
            isShowWindDirectView: false
          });
        }}
      />
    );

    return (
      <View style={LHCommonStyle.pageGrayStyle}>
        <LHStandardListSwipeout
          data={this.getData()}
        />
        {actionSheetModeView}
        {actionSheetTempView}
        {actionSheetSpeedView}
        {actionSheetWindDirectView}
      </View>
    );
  }
}

export default LHCustomScenePage;