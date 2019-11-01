/*
 * File: LHMainPage.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 29th August 2019 9:59:20 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import React from 'react';
import {
  View
} from 'react-native';
import {
  Package,
  Device,
  DeviceEvent,
  PackageEvent
} from 'miot';
import {
  LHTitleBarCustom, LHCommonStyles
} from 'LHCommonUI';
import {
  LHMiServer,
  LHUiUtils,
  LHPureRenderDecorator,
  LHDeviceUtils,
  CommonMethod,
  LHToastUtils,
  LHCommonLocalizableString,
  LHAuthorizationUtils,
  dp
} from 'LHCommonFunction';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Host from 'miot/Host';
import { UIActivityIndicator } from 'react-native-indicators';
import Resources from '../Resources';
import LHRemoteUtils from './Utils/LHRemoteUtils';
import LHCrcUtils from './Utils/LHCrcUtils';
import LHRemote from './Model/LHRemote';
import UpdateRemoteModelActions from './Redux/Actions/RemoteModel';
import SettingActionsReducers from './Redux/Actions/Settings';
import UpdateStatusActions from './Redux/Actions/AcControl';
import PluginConfig from './PluginConfig';
import LHAcStatusView, { LHAcStatusViewActionKey } from './Page/MainView/LHAcStatusView';
import LHAcUnmatchView from './Page/MainView/LHAcUnmatchView';
import LHAcNonStatusView from './Page/MainView/LHAcNonStatusView';
import LHRpcHost from './Host/LHRpcHost';
import LHAcPartner from './Model/LHAcPartner';
import LHAcStatus from './Model/LHAcStatus';
import LHLocalizableString from './Localized/LHLocalizableString';
import LHIRHost from './Host/Infrared/LHIRHost';

let Instantce = null;

// 当前的Remote的类型
const RemoteType = {
  RemoteTypeNon: 0,
  RemoteTypeLocal: 1,
  RemoteTypeRemote: 2,
  RemoteTypeFail: 3
};


class LHMainPage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const deviceName = navigation.getParam('deviceName');
    return {
      headerTransparent: true,
      header: (
        <View>
          <LHTitleBarCustom
            title={deviceName || Device.name}
            titleStyle={{ color: '#fff' }}
            statusBarStyle="light"
            style={[LHCommonStyles.navigatorWithoutBorderBotoom, { backgroundColor: 'transparent' }]}
            backBtnIcon="white"
            onPressLeft={() => { Package.exit(); }}
            rightButtons={[{
              type: 'deafultMoreBtn',
              btnIconType: 'white',
              press: () => {
                if (Instantce) {
                  Instantce.gotoSetting();
                }
              }
            }]}
          />
        </View>
      )
    };
  };

  // MARK: life cycle
  constructor(props) {
    super(props);
    Instantce = this;
    this.isInPackage = false;
    this.state = {
      sendingStack: [],
      currentRemoteType: RemoteType.RemoteTypeNon
    };
  }

  componentWillMount() {
    // 检测授权
    this.checkAuthorization();
    // 更新remote
    this.getDeviceModel();
    // subscription
    this.addDeviceNameChangedListener();
    this.setupPageSubscription();
    this.setupViewWillAppearSubscription();
  }

  componentWillUnmount() {
    // remove subscription
    this.removeDevicePoller();
    this.removeDeviceNameChangedListener();
    this.removeSetupPageSubscription();
    this.removeViewWillAppearSubscription();
  }

  // MARK: checkAuthorization
  checkAuthorization() {
    const onAuthorizationSuccess = () => {
      // 获取设置页属性，空调状态，订阅空调状态
      this.getDeviceSettingsAndStatus();
      this.getElectricityData();
      this.setupDevicePoller();
    };

    if (Device.isShared) {
      onAuthorizationSuccess();
      return;
    }
    this.authorizationCancelListener = LHAuthorizationUtils.Authorization({
      licenseTitle: LHCommonLocalizableString.common_setting_user_agreement,
      policyResource: Resources.PolicyLicense,
      policyTitle: LHCommonLocalizableString.common_setting_privacy_policy,
      authorizationSucc: () => {
        onAuthorizationSuccess();
      }
    });
  }

  // MARK: poll in loop
  setupDevicePoller() {
    this.removeDevicePoller();
    this.devicePoller = setInterval(() => {
      const { navigation, Remote } = this.props;
      if (!navigation.isFocused() || !this.isInPackage) {
        return;
      }

      if (!Device.isOnline || !Remote || !Remote.isStatusRemote()) {
        return;
      }

      // remotely status and settings
      const {
        UpdateSettings, UpdateAcDeviceStatus
      } = this.props;

      const shouldUpdate = (objFrom, objTo) => {
        const entrance = Object.entries(objFrom);
        for (let index = 0; index < entrance.length; index += 1) {
          const [key, value] = entrance[index];
          if (objTo[key] !== value) {
            return true;
          }
        }
        return false;
      };

      const requestTime = new Date().getTime();
      LHRpcHost.getDeviceData()
        .then((res) => {
          console.log('✅ success setupDevicePoller getDeviceData ' + JSON.stringify(res));
          const { AcStatus, AcPartner } = this.props;
          const {
            workMode, power, status, nightLight, quickCoolState, sleepState
          } = res;
          const settings = {
            workMode, powerData: power, nightLight, quickCoolState, sleepState
          };
          if (shouldUpdate(settings, AcPartner)) {
            UpdateSettings(settings);
          }
          // 如果控制了空调，那在控制空调之前的获取状态就忽略掉，优化控制后页面闪的问题
          if (shouldUpdate(status, AcStatus) && requestTime > (this.lastControlTime || 0)) {
            UpdateAcDeviceStatus(status);
          }
        }).catch((err) => {
          console.log('❌ failure setupDevicePoller getDeviceData ' + JSON.stringify(err.message));
        });
    }, 3000);
  }

  // eslint-disable-next-line class-methods-use-this
  removeDevicePoller() {
    if (this.devicePoller) clearInterval(this.devicePoller);
  }

  // MARK: subscription
  addDeviceNameChangedListener() {
    this.removeDeviceNameChangedListener();
    this.deviceNameChangedListener = DeviceEvent.deviceNameChanged.addListener((event) => {
      const { navigation } = this.props;
      navigation.setParams({
        deviceName: event.name
      });
    });
  }

  removeDeviceNameChangedListener() {
    if (this.deviceNameChangedListener) {
      this.deviceNameChangedListener.remove();
    }
  }

  // 监听页面，回到首页在后台静默更新电量以及空调状态
  setupPageSubscription() {
    this.removeSetupPageSubscription();
    // navigation listener
    const { navigation } = this.props;
    this.willFocusSubscription = navigation.addListener(
      'willFocus',
      () => {
        console.log('TCL: setupPageSubscription -> willFocusSubscription willFocus');
        this.isInPackage = true;
        if (this.isNotFirstIn) {
          // 首次进入页面会在will mount 获取数据，不需要在这里
          this.getElectricityData();
        } else {
          this.isNotFirstIn = true;
        }
      }
    );
  }

  removeSetupPageSubscription() {
    if (this.willFocusSubscription) {
      this.willFocusSubscription.remove();
    }
  }

  // 监听原生页面，回到首页在后台静默更新电量以及空调状态
  setupViewWillAppearSubscription() {
    this.removeViewWillAppearSubscription();
    this.viewWillAppearSubscription = PackageEvent.packageViewWillAppear.addListener(() => {
      console.log('PackageEvent packageViewWillAppear');
      const { navigation } = this.props;
      this.isInPackage = true;
      // 首次进入插件不需要在这里获取数据
      if (this.isNotFirstInPackage && navigation.isFocused()) {
        this.getElectricityData();
      } else {
        this.isNotFirstInPackage = true;
      }
    });
    this.packageWillPause = PackageEvent.packageWillPause.addListener(() => {
      console.log('PackageEvent packageWillPause');
      this.isInPackage = false;
    });
    this.packageDidResume = PackageEvent.packageDidResume.addListener(() => {
      console.log('PackageEvent packageDidResume');
      this.isInPackage = true;
    });
    this.packageWillExit = PackageEvent.packageWillExit.addListener(() => {
      console.log('PackageEvent packageWillExit');
      this.isInPackage = false;
    });
  }

  removeViewWillAppearSubscription() {
    if (this.viewWillAppearSubscription) {
      this.viewWillAppearSubscription.remove();
    }
    if (this.packageWillPause) {
      this.packageWillPause.remove();
    }
    if (this.packageDidResume) {
      this.packageDidResume.remove();
    }
    if (this.packageWillExit) {
      this.packageWillExit.remove();
    }
  }

  // MARK: get device props
  getDeviceSettingsAndStatus(showToastIfFail = false) {
    const {
      UpdateSettings, UpdateAcDeviceStatus, RestoreAcDeviceStatus
    } = this.props;

    // locally status
    RestoreAcDeviceStatus()
      .then((res) => {
        console.log(res);
      });

    // 先读缓存
    LHMiServer.GetHostStorage(PluginConfig.SettingsCacheKey).then((res) => {
      if (res) {
        // 功率和电量不需要显示缓存数据
        delete res.powerData;
        delete res.todayElectricity;
        delete res.monthElectricity;
        UpdateSettings(res);
      }
    });

    // remotely status and settings
    LHRpcHost.getDeviceData()
      .then((res) => {
        const {
          workMode, power, status, nightLight, quickCoolState, sleepState
        } = res;
        console.log('✅ success getDeviceData ' + JSON.stringify(res));
        const settings = {
          workMode, powerData: power, nightLight, quickCoolState, sleepState
        };
        UpdateSettings(settings);
        UpdateAcDeviceStatus(status);
      }).catch((err) => {
        if (showToastIfFail) LHToastUtils.showShortToast(LHCommonLocalizableString.common_tips_loading_failed);
        console.log('❌ failure getDeviceData ' + JSON.stringify(err.message));
      });
  }

  // MARK: get electricity data
  getElectricityData() {
    const {
      GetAcDayElec, GetAcMonthElec
    } = this.props;
    GetAcDayElec()
      .then((res) => {
        console.log('✅ success GetAcDayElec' + JSON.stringify(res));
      })
      .catch((err) => {
        console.log('❌ failure GetAcDayElec' + JSON.stringify(err));
      });

    GetAcMonthElec()
      .then((res) => {
        console.log('✅ success GetAcMonthElec' + JSON.stringify(res));
      })
      .catch((err) => {
        console.log('❌ failure GetAcMonthElec' + JSON.stringify(err));
      });
  }

  // MARK: action event handler
  onStatusViewAction(action) {
    const { key, value } = action;
    const {
      UpdateAcDeviceStatus,
      Remote: remoteModel,
      AcStatus: status,
      navigation
    } = this.props;
    const { sendingStack: stackRef } = this.state;

    const pushKeyToStack = (keyValue) => {
      const sendingStack = CommonMethod.DeepClone(stackRef);
      sendingStack.push(keyValue);
      this.setState({
        sendingStack
      });
    };

    const removeKeyFromStack = (keyValue) => {
      const sendingStack = CommonMethod.DeepClone(stackRef);
      for (let index = sendingStack.length - 1; index >= 0; index -= 1) {
        const element = sendingStack[index];
        if (element === keyValue) {
          sendingStack.splice(index, index + 1);
          break;
        }
      }

      this.setState({
        sendingStack
      });
    };

    const onStatusViewActionRemotely = (keyValue) => {
      const newStatus = LHAcStatus.statusCopy(status);
      const control = { remoteModel, status };
      const { Remote } = this.props;
      switch (keyValue) {
        // 开关
        case LHAcStatusViewActionKey.onPowerClicked:
          newStatus.powerState = value ? 1 : 0;
          UpdateAcDeviceStatus(newStatus);
          return LHIRHost.setACPower(value, control)
            .catch((err) => {
              UpdateAcDeviceStatus(status);
              throw err;
            });

        // 模式
        case LHAcStatusViewActionKey.onModeClicked:
          newStatus.modeState = Number(value);
          UpdateAcDeviceStatus(newStatus);
          return LHIRHost.setAcMode(value, control)
            .catch((err) => {
              UpdateAcDeviceStatus(status);
              throw err;
            });

        // 风速
        case LHAcStatusViewActionKey.onSpeedClicked:
          newStatus.windSpeed = Number(value);
          UpdateAcDeviceStatus(newStatus);
          return LHIRHost.setACWindSpeed(value, control)
            .catch((err) => {
              UpdateAcDeviceStatus(status);
              throw err;
            });

        // 扫风
        case LHAcStatusViewActionKey.onSwingClicked:
          newStatus.swingState = value ? 0 : 1;
          UpdateAcDeviceStatus(newStatus);
          return LHIRHost.setACSwing(value, control)
            .catch((err) => {
              UpdateAcDeviceStatus(status);
              throw err;
            });

        // 风向
        case LHAcStatusViewActionKey.onSwingDirectionClicked:
          newStatus.windDirection = Remote.findNextWindDirection(status.windDirection);
          newStatus.swingState = 1; // 开风向要将扫风关掉
          UpdateAcDeviceStatus(newStatus);
          return LHIRHost.setACWindDirection(newStatus.windDirection)
            .catch((err) => {
              UpdateAcDeviceStatus(status);
              throw err;
            });

        // 温度
        case LHAcStatusViewActionKey.onTempClicked:
          newStatus.temperature = Number(value);
          UpdateAcDeviceStatus(newStatus);
          return LHIRHost.setACTemperature(value, control)
            .catch((err) => {
              UpdateAcDeviceStatus(status);
              throw err;
            });

        default:
          return Promise.resolve('onStatusViewActionRemotely default');
      }
    };

    switch (key) {
      case LHAcStatusViewActionKey.onSleepModeClicked:
        navigation.navigate('LHSleepPage');
        break;
      case LHAcStatusViewActionKey.onQuickCoolClicked:
        navigation.navigate('LHQuickCoolPage');
        break;
      case LHAcStatusViewActionKey.onTimerClicked:
        navigation.navigate('LHTimeListPage');
        break;
      case LHAcStatusViewActionKey.onDayElec:
        navigation.navigate('LHCurvePage', { dateActive: 0, title: LHCommonLocalizableString.common_electricity, type: 'electricity' });
        break;
      case LHAcStatusViewActionKey.onMonthElec:
        navigation.navigate('LHCurvePage', { dateActive: 2, title: LHCommonLocalizableString.common_electricity, type: 'electricity' });
        break;
      case LHAcStatusViewActionKey.onPowerElec:
        navigation.navigate('LHCurvePage', { title: LHCommonLocalizableString.common_power_history, type: 'power' });
        break;

      case LHAcStatusViewActionKey.onDelayClicked:
        this.isInPackage = false;
        Host.ui.openCountDownPage(true, {
          identify: PluginConfig.AcCountDownId,
          onMethod: 'set_ac',
          offMethod: 'set_ac',
          onParam: 'P1',
          offParam: 'P1',
          displayName: LHCommonLocalizableString.common_count_down.replace('{XX}', LHLocalizableString.mi_acpartner_two_defaultname)
        });
        break;

      default:
        // 控制的时候，将忽略控制之前的pull到的状态，并且刷新puller
        this.lastControlTime = new Date().getTime();
        this.setupDevicePoller();

        pushKeyToStack(key);
        onStatusViewActionRemotely(key)
          .then(() => {
            removeKeyFromStack(key);
          })
          .catch(() => {
            removeKeyFromStack(key);
          });
        break;
    }
  }

  // 获取当前设备匹配的码库id，并更新码库
  // MARK: update remote
  getDeviceModel() {
    this.fetchDeviceModel((remote, type) => {
      // 如果本地码库和设备码库不一样的话，这里会调两次
      const { UpdateRemote } = this.props;
      UpdateRemote(remote);
      // 更新UI
      this.setState({
        currentRemoteType: type
      });

      this.sendRemoteToDeviceIfNeeded(remote, type);
    }, () => {
      // 失败而且没有缓存，就toast一下，并显示匹配页面
      const { Remote } = this.props;
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_tips_loading_failed);
      if (!Remote.remoteModel) {
        // 更新UI
        this.setState({
          currentRemoteType: RemoteType.RemoteTypeFail
        });
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  sendRemoteToDeviceIfNeeded(remote, type) {
    // 成功获取remote，如果是新固件的话需要发Remote到设备
    if (!(PluginConfig.IsSupportRpcIRControl() && remote.isStatusRemote())) {
      return;
    }

    // 本地的码库可能不准确，用云端的码库
    if (type !== RemoteType.RemoteTypeRemote) {
      return;
    }
    const { controllerId, remoteModel } = remote;
    const { modes, swing } = remoteModel; // 获取有状态空调的那一部分

    function sendRemoteToDevice() {
      // 发送码库范围到设备，失败重试3次
      CommonMethod.PromiseRetry(LHRpcHost.setRemoteListCrc, { params: [controllerId, { modes, swing }] })
        .then((res1) => {
          console.log('✅ success PromiseRetry setRemoteListCrc' + JSON.stringify(res1));
        })
        .catch((err) => {
          console.log('❌ failure PromiseRetry setRemoteListCrc' + JSON.stringify(err));
        });
    }
    // 获取设备的crc
    CommonMethod.PromiseRetry(LHRpcHost.getDeviceData)
      .then((res) => {
        const { listCrc32 } = res;
        console.log('✅ success getDeviceData listCrc32 ' + JSON.stringify(res));
        const localCrc = LHCrcUtils.getRemoteCrc32(controllerId, { modes, swing });
        if (localCrc !== listCrc32) {
          sendRemoteToDevice();
        }
      })
      .catch((err) => {
        console.log('❌ failure getDeviceData listCrc32 ' + JSON.stringify(err));
        // 不知道是否要传，那就传，保证设备使用正常
        sendRemoteToDevice();
      });
  }

  // onSuccess 可能回调多次
  fetchDeviceModel(onSuccess, onFailure) {
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

    // 是否remote从云端更新
    let hasUpdateRemotelyFlag = false;

    // locally 更新码库
    LHRpcHost.restoreAcModelCache()
      .then((result) => {
        return parseIds(result);
      })
      .then((res) => {
        const { controllerId, brandId } = res;
        // 获取并更新controllerId的remote
        this.getRemoteModel(controllerId)
          .then((remoteModel) => {
            // 如果remote已经有数据了，表示从云端获取比从缓存获取快，以云端数据为准，就没必要刷新
            if (!hasUpdateRemotelyFlag) {
              const newRemote = new LHRemote({ brandId, controllerId, remoteModel });
              if (typeof onSuccess === 'function') onSuccess(newRemote, RemoteType.RemoteTypeLocal);
            }
          });
      });

    // remotely 更新码库
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
        const { Remote } = this.props;
        this.getRemoteModel(controllerId)
          .then((remoteModel) => {
            hasUpdateRemotelyFlag = true;
            const newRemote = new LHRemote({ brandId, controllerId, remoteModel });
            if (typeof onSuccess === 'function') onSuccess(newRemote, RemoteType.RemoteTypeRemote);
          }).catch((err) => {
            // 云端获取的ac_model的controllerId和本地缓存的不一致，重新获取LHRemote失败，返回失败
            if (Remote.controllerId !== controllerId) {
              if (typeof onFailure === 'function') onFailure(err);
            }
          });
      })
      .catch((err) => {
        // 获取云端码库失败
        if (typeof onFailure === 'function') onFailure(err);
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

  gotoSetting() {
    const { navigation } = this.props;
    navigation.navigate('LHSettingPage');
  }

  // MARK: render
  render() {
    const {
      Remote, AcStatus, navigation, AcPartner
    } = this.props;
    const { sendingStack, currentRemoteType } = this.state;

    // 是否支持风向
    let isSupportWindDirection = false;
    const directArr = Remote.supportedSwingDirect();
    if (Array.isArray(directArr) && directArr.length && PluginConfig.IsSupportRpcIRControl()) {
      isSupportWindDirection = true;
    }

    const naviBarHeight = LHDeviceUtils.statusBarHeight + LHUiUtils.TitleBarHeight;
    let content = null;
    let bgColor = ['#888E98', '#797E88'];
    content = (
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <View style={{
          alignSelf: 'center', height: dp(24), width: dp(24), marginTop: dp(260)
        }}
        >
          <UIActivityIndicator
            color="white"
            size={dp(24)}
          />
        </View>
      </View>
    );

    if (Remote.remoteModel) {
      if (Remote.isStatusRemote()) {
        const { powerState } = AcStatus;
        bgColor = powerState ? ['#6093FF', '#5FA7FE'] : ['#888E98', '#797E88'];
        content = (
          <LHAcStatusView
            Remote={Remote}
            AcStatus={AcStatus}
            isSendingIrCode={!!sendingStack.length}
            isShowElecCard={AcPartner.workMode === LHAcPartner.AcWorkModeAC}
            todayElectricity={AcPartner.todayElectricity}
            monthElectricity={AcPartner.monthElectricity}
            powerData={AcPartner.powerData}
            isSharedDevice={Device.isShared}
            isQuickCooling={!!AcPartner.quickCoolState}
            isSleeping={!!AcPartner.sleepState}
            isSupportWindDirection={isSupportWindDirection}
            onEventAction={(action) => {
              this.onStatusViewAction(action);
            }}
          />
        );
      } else {
        bgColor = ['#6093FF', '#5FA7FE'];
        content = (
          <LHAcNonStatusView
            Remote={Remote}
            navigation={navigation}
            isShowElecCard={AcPartner.workMode === LHAcPartner.AcWorkModeAC}
            todayElectricity={AcPartner.todayElectricity}
            monthElectricity={AcPartner.monthElectricity}
            powerData={AcPartner.powerData}
          />
        );
      }
    } else if (currentRemoteType) {
      content = (
        <LHAcUnmatchView
          onEventAction={() => {
            navigation.navigate('LHMatchGuidePage');
          }}
        />
      );
    }


    return (
      <LinearGradient
        colors={bgColor}
        style={{ flex: 1, marginTop: -naviBarHeight }}
      >
        <View style={{ flex: 1, marginTop: naviBarHeight }}>
          {content}
        </View>
      </LinearGradient>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Remote: state.RemoteModelReducers,
    AcStatus: state.StatusActionsReducers,
    AcPartner: state.SettingActionsReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Object.assign({}, UpdateRemoteModelActions, UpdateStatusActions, SettingActionsReducers), dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LHPureRenderDecorator(LHMainPage));
