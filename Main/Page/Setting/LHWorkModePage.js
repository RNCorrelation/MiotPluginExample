import React from 'react';
import {
  View, ImageBackground, TouchableOpacity, Image
} from 'react-native';
import {
  LHMiServer, LHPureRenderDecorator, LHUiUtils, LHToastUtils, LHCommonLocalizableString, LHDeviceUtils
} from 'LHCommonFunction';
import {
  LHCommonStyles, LHText, LHTitleBarCustom
} from 'LHCommonUI';
import PluginConfig from 'PluginConfig';
import Resources from 'Resources';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LHRpcHost from '../../Host/LHRpcHost';
import LHAcPartner from '../../Model/LHAcPartner';
import SettingActionsReducers from '../../Redux/Actions/Settings';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';

let preWorkMode = LHAcPartner.AcWorkModeUnknown;

class LHWorkModePage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_setting_work_mode}
            style={[LHCommonStyles.navigatorWithBorderBotoom]}
            onPressLeft={() => {
              navigation.goBack();
            }}
          />
        </View>
      )
    };
  };

  componentWillMount() {
    const {
      UpdateSettings
    } = this.props;

    LHRpcHost.getPropAcMode().then((res) => {
      preWorkMode = res;
      LHMiServer.SetHostStorage(PluginConfig.WorkModeCacheKey, res);
      UpdateSettings({ workMode: res });
    }).catch(() => {
      LHMiServer.GetHostStorage(PluginConfig.WorkModeCacheKey).then((res) => {
        if (res) {
          preWorkMode = res;
          UpdateSettings({ workMode: res });
        }
      });
    });
  }

  setPropAcMode = (value) => {
    const {
      UpdateSettings
    } = this.props;
    UpdateSettings({ workMode: value });
    LHRpcHost.setPropAcMode(value).then(() => {
      preWorkMode = value;
      LHMiServer.SetHostStorage(PluginConfig.WorkModeCacheKey, value);
    }).catch(() => {
      LHMiServer.SetHostStorage(PluginConfig.WorkModeCacheKey, preWorkMode);
      UpdateSettings({ workMode: preWorkMode });
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
    });
  };


  render() {
    const { AcPartner } = this.props;
    const isPlug = (AcPartner.workMode === LHAcPartner.AcWorkModeAC);
    return (
      <View style={LHCommonStyles.pageGrayStyle}>
        <View style={{
          flex: 2,
          marginBottom: LHUiUtils.GetPx(116) + LHDeviceUtils.AppHomeIndicatorHeight
        }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              marginLeft: LHUiUtils.GetPx(10),
              marginRight: LHUiUtils.GetPx(10),
              marginTop: LHUiUtils.GetPx(10)
            }}
            activeOpacity={1}
            onPress={() => {
              this.setPropAcMode(LHAcPartner.AcWorkModeAC);
            }}
          >
            <ImageBackground
              resizeMode="stretch"
              source={Resources.SettingImage.acDottedLine}
              style={{
                flex: 1,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: LHUiUtils.GetPx(12.5)
              }}
            >
              <Image
                source={isPlug ? Resources.SettingImage.acWorkModeNormalSelect : Resources.SettingImage.acWorkModeNormalUnSelect}
                style={{
                  width: LHUiUtils.GetPx(100),
                  height: LHUiUtils.GetPx(100)
                }}
              />
              <LHText
                style={{
                  fontSize: LHUiUtils.GetPx(12),
                  marginTop: LHUiUtils.GetPx(16.5),
                  color: PluginConfig.Black80Color
                }}
              >
                {LHLocalizedStrings.mi_acpartner_setting_plug_normally}
              </LHText>
            </ImageBackground>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              marginLeft: LHUiUtils.GetPx(10),
              marginRight: LHUiUtils.GetPx(10),
              marginTop: LHUiUtils.GetPx(10)
            }}
            onPress={() => {
              this.setPropAcMode(LHAcPartner.AcWorkModeACNotPlug);
            }}
          >
            <ImageBackground
              resizeMode="stretch"
              source={Resources.SettingImage.acDottedLine}
              style={{
                flex: 1,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: LHUiUtils.GetPx(12.5)
              }}
            >
              <Image
                source={isPlug ? Resources.SettingImage.acWorkModeNoPlugUnSelect : Resources.SettingImage.acWorkModeNoPlugSelect}
                style={{
                  width: LHUiUtils.GetPx(100),
                  height: LHUiUtils.GetPx(100)
                }}
              />
              <LHText
                style={{
                  fontSize: LHUiUtils.GetPx(12),
                  marginTop: LHUiUtils.GetPx(16.5),
                  color: PluginConfig.Black80Color
                }}
              >
                {LHLocalizedStrings.mi_acpartner_setting_plug_no_normally}
              </LHText>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    AcPartner: state.SettingActionsReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Object.assign({}, SettingActionsReducers), dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LHPureRenderDecorator(LHWorkModePage));