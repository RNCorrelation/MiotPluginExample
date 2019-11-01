import React from 'react';
import { BackHandler, View } from 'react-native';
import { Device } from 'miot';
import {
  LHCommonLocalizableString, LHSettingItem, LHMiServer, LHPureRenderDecorator, LHDialogUtils, LHUiUtils, LHToastUtils
} from 'LHCommonFunction';
import { LHCommonStyles, LHTitleBarCustom, LHSetting } from 'LHCommonUI';
import PluginConfig from 'PluginConfig';
import Resources from 'Resources';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LHRpcHost from '../../Host/LHRpcHost';
import LHAcPartner from '../../Model/LHAcPartner';
import LHAcCloudHost from '../../Host/LHAcCloudHost';
import SettingActionsReducers from '../../Redux/Actions/Settings';
import UpdateRemoteModelActions from '../../Redux/Actions/RemoteModel';
import LHLocalizableString from '../../Localized/LHLocalizableString';

let backPressed = false;
class LHSettingPage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHCommonLocalizableString.common_setting_title}
            style={[LHCommonStyles.navigatorWithBorderBotoom]}
            onPressLeft={() => {
              backPressed = true;
              navigation.goBack();
            }}
          />
        </View>
      )
    };
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      brandName: LHLocalizableString.mi_acpartner_setting_default_curr_pair_ac
    };
  }

  componentWillMount() {
    this.getDeviceSettings();
    const {
      Remote
    } = this.props;
    console.log(Remote);
    LHAcCloudHost.getBrandName(Remote.brandId).then((res) => {
      this.setState({ brandName: res });
      LHMiServer.SetHostStorage(PluginConfig.BrandNameCacheKey, res);
    }).catch(() => {
      LHMiServer.GetHostStorage(PluginConfig.BrandNameCacheKey).then((res) => {
        if (res) {
          this.setState({ brandName: res });
        }
      });
    });
  }

  componentDidMount() {
    backPressed = false;
    BackHandler.addEventListener('hardwareBackPress', this.backHandler);
  }

  componentWillUnmount() {
    if (this.backHandler) {
      BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
    }
    backPressed = false;
  }

  backHandler = () => {
    backPressed = true;
    return false;
  };

  isBackPressed = () => {
    return backPressed;
  };

  getDeviceSettings() {
    const {
      UpdateSettings
    } = this.props;
    LHMiServer.GetHostStorage(PluginConfig.CloseLightCacheKey).then((res) => {
      if (res) {
        UpdateSettings({
          nightLight: res
        });
      }
    });
    LHMiServer.GetHostStorage(PluginConfig.WorkModeCacheKey).then((res) => {
      if (res) {
        UpdateSettings({
          workMode: res
        });
      }
    });
    LHRpcHost.getDeviceData()
      .then((res) => {
        const {
          workMode, power, status, nightLight
        } = res;
        UpdateSettings({
          workMode, powerData: power, status, nightLight
        });
        LHMiServer.SetHostStorage(PluginConfig.WorkModeCacheKey, workMode);
        LHMiServer.SetHostStorage(PluginConfig.CloseLightCacheKey, nightLight);
      }).catch((res) => {
        console.log(res);
        if (res && res.error && res.error.code && res.error.code === -12) {
          return;
        }
        LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
      });
  }

  setCloseNight = (value) => {
    const {
      UpdateSettings
    } = this.props;
    UpdateSettings({
      nightLight: value ? 0 : 1
    });
    LHMiServer.SetHostStorage(PluginConfig.CloseLightCacheKey, value ? 0 : 1);
    LHRpcHost.setPropEnNnlight(value).then(() => {
    }).catch(() => {
      UpdateSettings({
        nightLight: value ? 1 : 0
      });
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
    });
  };

  getPageData() {
    const {
      brandName
    } = this.state;
    const {
      AcPartner, Remote
    } = this.props;
    console.log(AcPartner);
    const pluginItem = () => {
      return LHSettingItem.getSettingItem('plugIn', {
        rightDescription: PluginConfig.PluginVersion
      });
    };
    let workModeDesc = '';
    if (AcPartner.workMode === LHAcPartner.AcWorkModeAC) {
      workModeDesc = LHLocalizableString.mi_acpartner_setting_plug_normally;
    } else if (AcPartner.workMode === LHAcPartner.AcWorkModeACNotPlug) {
      workModeDesc = LHLocalizableString.mi_acpartner_setting_plug_no_normally;
    }
    const matchDesc = (Remote.controllerId === 0 ? LHLocalizableString.mi_acpartner_setting_not_paired : (brandName + ' ' + Remote.controllerId));
    const items = [
      // 工作模式
      {
        title: LHLocalizableString.mi_acpartner_setting_work_mode,
        rightDescription: workModeDesc,
        press: () => {
          const { navigation } = this.props;
          navigation.navigate('LHWorkModePage', { workMode: AcPartner.workMode });
        }
      },
      // 当前匹配
      {
        title: LHLocalizableString.mi_acpartner_setting_curr_pairing,
        rightDescription: matchDesc,
        press: () => {
          if (Remote.controllerId > 0) {
            LHDialogUtils.MessageDialogShow({
              title: LHLocalizableString.mi_acpartner_setting_replace_match,
              message: LHLocalizableString.mi_acpartner_setting_replace_match_tips,
              confirm: LHCommonLocalizableString.common_ok,
              cancel: LHCommonLocalizableString.common_cancel,
              confirmStyle: {
                color: PluginConfig.MainColor
              },
              onConfirm: () => {
                const { navigation } = this.props;
                navigation.navigate('LHMatchGuidePage');
              }
            });
          } else {
            const { navigation } = this.props;
            navigation.navigate('LHMatchGuidePage');
          }
        }
      },
      // 关闭指示灯
      {
        title: LHLocalizableString.mi_acpartner_setting_turn_off_indicator,
        description: LHLocalizableString.mi_acpartner_setting_turn_off_indicator_range,
        hasSwitch: true,
        useControlledSwitch: true,
        switchValue: AcPartner.nightLight === 0,
        switchColor: PluginConfig.MainColor,
        hideRightArrow: true,
        onSwitchChange: (value) => {
          this.setCloseNight(value);
        }
      }
    ];

    if (!Device.isShared) {
      items.push({
        title: LHLocalizableString.mi_acpartner_setting_pairing_customer,
        press: () => {
          const { navigation } = this.props;
          LHAcCloudHost.loadUserConfigsDataAndGoPage(navigation, this.isBackPressed, false);
        }
      });
    }
    items.push(pluginItem());

    return items.filter((item) => {
      return item !== null && typeof item !== 'undefined';
    });
  }


  render() {
    const pageData = this.getPageData();
    const { navigation } = this.props;
    return (
      <View style={LHCommonStyles.pageGrayStyle}>
        <LHSetting
          navigation={navigation}
          PolicyLicenseUrl={Resources.PolicyLicense}
          settingItems={pageData}
          showShare
          hideGatewayShare={false}
          showIftt
          showFirmwareUpgrate
          showIsHomeKitDevice
          needFirmwareUpgrateDot
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Remote: state.RemoteModelReducers,
    AcPartner: state.SettingActionsReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Object.assign({}, UpdateRemoteModelActions, SettingActionsReducers), dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LHPureRenderDecorator(LHSettingPage));