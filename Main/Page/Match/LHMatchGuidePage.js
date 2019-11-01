/*
 * File Created: 2019-08-29 12:25
 * Author: 凌志文 (zhiwen.ling@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import {
  LHCommonStyles, LHText, LHButtonGroup, LHTitleBarCustom
} from 'LHCommonUI';
import {
  LHUiUtils, LHDeviceUtils, LHDialogUtils, LHCommonLocalizableString, LHMiServer, LHPureRenderDecorator
} from 'LHCommonFunction';
import Resources from 'Resources';
import PluginConfig from 'PluginConfig';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';
import LHRpcHost from '../../Host/LHRpcHost';
import LHAcPartner from '../../Model/LHAcPartner';
import SettingActionsReducers from '../../Redux/Actions/Settings';

const { height } = Dimensions.get('window');

class LHMatchGuidePage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_match_ac}
            style={[LHCommonStyles.navigatorWithBorderBotoom]}
            onPressLeft={() => {
              navigation.goBack();
            }}
          />
        </View>
      )
    };
  };

  componentDidMount() {
    this.getScreenHeight();
  }

  constructor(props) {
    super(props);
    this.state = {
      screenHeight: height
    };
  }

  setPropAcMode = (value) => {
    const {
      UpdateSettings
    } = this.props;
    LHRpcHost.setPropAcMode(value).then(() => {
      UpdateSettings({ workMode: value });
      LHMiServer.SetHostStorage(PluginConfig.WorkModeCacheKey, value);
    });
  };

  getScreenHeight() {
    LHDeviceUtils.GetPhoneScreenHeight((value) => {
      this.setState({ screenHeight: value });
    });
  }

  render() {
    const {
      screenHeight
    } = this.state;
    let marginTop = 126 * screenHeight / 780;
    const gap = marginTop - LHUiUtils.GetPx(126);
    marginTop += (gap > 0 ? gap : 2 * gap) / 3;
    return (
      <View style={LHCommonStyles.pageGrayStyle}>
        <View
          style={{
            flex: 1,
            alignItems: 'center'
          }}
        >
          <Image
            source={Resources.MatchImage.lumiAcMatchPic}
            style={{
              height: LHUiUtils.GetPx(155),
              width: LHUiUtils.GetPx(154),
              marginTop,
              marginBottom: LHUiUtils.GetPx(18)
            }}
          />
          <LHText
            style={{ color: PluginConfig.MainTextDetailcolor, fontSize: LHUiUtils.GetPx(15) }}
          >
            {LHLocalizedStrings.mi_acpartner_match_ac_plug_in_hint}
          </LHText>
        </View>
        <LHButtonGroup
          style={{
            marginHorizontal: LHUiUtils.GetPx(24),
            marginBottom: LHUiUtils.GetPx(24) + LHDeviceUtils.AppHomeIndicatorHeight
          }}
          buttons={[{
            btnText: LHLocalizedStrings.mi_acpartner_match_ac_no_plug_in,
            onPress: () => {
              LHDialogUtils.MessageDialogShow({
                message: LHLocalizedStrings.mi_acpartner_match_ac_no_plug_in_hint,
                messageStyle: {
                  textAlign: 'center',
                  fontSize: LHUiUtils.GetPx(15),
                  color: LHUiUtils.MiJiaSubTitleColor
                },
                confirm: LHCommonLocalizableString.common_ok,
                confirmStyle: {
                  color: LHUiUtils.MiJiaSubTitleColor
                },
                onConfirm: () => {
                  this.setPropAcMode(LHAcPartner.AcWorkModeACNotPlug);
                  const { navigation } = this.props;
                  navigation.navigate('LHBrandListPage');
                }
              });
            }
          },
          {
            btnText: LHLocalizedStrings.mi_acpartner_match_ac_plug_in,
            onPress: () => {
              this.setPropAcMode(LHAcPartner.AcWorkModeAC);
              const { navigation } = this.props;
              navigation.navigate('LHBrandListPage');
            }
          }]}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(LHPureRenderDecorator(LHMatchGuidePage));