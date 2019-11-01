/*
 * File: LHQuickCoolPage.js
 * Project: com.lumi.acparnter
 * File Created: Wednesday, 4th September 2019 5:21:23 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import React, { Component } from 'react';
import {
  View, Image, StyleSheet, Dimensions
} from 'react-native';
import {
  LHCommonStyles, LHTitleBarCustom, LHStandardList, LHText, LHSeparator, LHStringModalPicker
} from 'LHCommonUI';
import {
  LHPureRenderDecorator, LHUiUtils, LHCommonLocalizableString, LHToastUtils, LHMiServer
} from 'LHCommonFunction';

import LHRpcHost from '../../Host/LHRpcHost';
import Resources from '../../../Resources';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';
import PluginConfig from '../../PluginConfig';

const { width } = Dimensions.get('window');

const footerStyles = StyleSheet.create({
  footerContainer: { backgroundColor: '#fff' },
  footerTitle: {
    marginLeft: LHUiUtils.GetPx(24), marginTop: LHUiUtils.GetPx(14), marginBottom: LHUiUtils.GetPx(14), fontSize: LHUiUtils.GetPx(15), color: '#000'
  },
  footerViewContainer: { marginLeft: LHUiUtils.GetPx(24), paddingBottom: LHUiUtils.GetPx(40) },
  footerTextTemp: {
    position: 'absolute', top: 0, left: LHUiUtils.GetPx(10), fontSize: LHUiUtils.GetPx(8), color: '#999'
  },
  footerTextLastTemp: {
    position: 'absolute', top: LHUiUtils.GetPx(37), right: LHUiUtils.GetPx(29), fontSize: LHUiUtils.GetPx(8), color: '#999'
  },
  footerTextPower: {
    position: 'absolute', left: LHUiUtils.GetPx(3), bottom: LHUiUtils.GetPx(24), fontSize: LHUiUtils.GetPx(8), color: '#999'
  },
  footerTextMinute: {
    fontSize: LHUiUtils.GetPx(8), color: '#999', marginTop: LHUiUtils.GetPx(29)
  },
  footerText20Left: {
    position: 'absolute', left: LHUiUtils.GetPx(45), bottom: LHUiUtils.GetPx(63), fontSize: LHUiUtils.GetPx(8), color: '#999'
  },
  footerText20Right: {
    fontSize: LHUiUtils.GetPx(8),
    color: '#999'
  },
  footerTempMinContainer: {
    position: 'absolute',
    right: LHUiUtils.GetPx(65),
    bottom: LHUiUtils.GetPx(24),
    alignItems: 'center'

  },
  footerLineV: { height: LHUiUtils.GetPx(175), width: LHUiUtils.GetPx(0.5), backgroundColor: '#ccc' },
  footerLineH: { height: LHUiUtils.GetPx(0.5), width: width - LHUiUtils.GetPx(24 * 2), backgroundColor: '#ccc' },
  footerImage: {
    position: 'absolute',
    left: LHUiUtils.GetPx(24),
    top: LHUiUtils.GetPx(18),
    height: LHUiUtils.GetPx(119),
    width: width - LHUiUtils.GetPx(48 * 2),
    flex: 1
  }
});

const defaultQuickTime = 20;

class LHQuickCoolPage extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_coolspeed_caption}
            style={[LHCommonStyles.navigatorWithBorderBotoom]}
            onPressLeft={() => {
              navigation.goBack();
            }}
          />
        </View>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isCool: false,
      quickTime: defaultQuickTime,
      showPicker: false,
      min: 1,
      max: 59
    };
  }


  componentWillMount() {
    this.getQuickCool();
  }

  // eslint-disable-next-line class-methods-use-this
  restoreQuickCoolCache() {
    return LHMiServer.GetHostStorage(PluginConfig.QuickCoolCacheKey);
  }

  // eslint-disable-next-line class-methods-use-this
  saveQuickCoolCache(arr) {
    console.log('✅success saveQuickCoolCache ' + PluginConfig.QuickCoolCacheKey + arr);
    LHMiServer.SetHostStorage(PluginConfig.QuickCoolCacheKey, arr);
  }

  getQuickCool() {
    // local
    this.restoreQuickCoolCache()
      .then((res) => {
        console.log('✅get cache' + res);
        if (res) {
          const [isCool, quickTime] = res;
          this.setState({
            isCool: !!isCool,
            quickTime: quickTime || defaultQuickTime
          });
          console.log('✅success get cache' + [isCool ? 1 : 0, quickTime]);
        }
      });

    // remote
    LHRpcHost.getQuickCool()
      .then((res) => {
        if (Array.isArray(res) && res.length >= 2) {
          const [isCool, quickTime] = res;
          this.setState({
            isCool,
            quickTime
          });
          this.saveQuickCoolCache(res);
          console.log('✅success get remote' + [isCool ? 1 : 0, quickTime]);
          return;
        }
        throw new Error('invalid quick cool data');
      }).catch((err) => {
        console.log('❌failure ' + JSON.stringify(err));
      });
  }

  // eslint-disable-next-line class-methods-use-this
  setQuickCool(isCool, quickTime) {
    const params = [isCool ? 1 : 0, quickTime];
    return LHRpcHost.setQuickCool(params)
      .then((res) => {
        console.log('✅success ' + params);
        this.saveQuickCoolCache(params);
        return res;
      }).catch((err) => {
        console.log('❌failure ' + [isCool ? 1 : 0, quickTime] + JSON.stringify(err));
        throw err;
      });
  }

  getPageData() {
    const { isCool, quickTime } = this.state;
    const section1 = [{
      title: LHLocalizedStrings.mi_acpartner_coolspeed_caption,
      description: LHLocalizedStrings.mi_acpartner_coolspeed_comment.replace('{value}', quickTime),
      hasSwitch: true,
      switchValue: !!isCool,
      useControlledSwitch: true,
      switchColor: '#5FA7FE',
      hideRightArrow: true,
      hideTopSeparatorLine: true,
      onSwitchChange: (value) => {
        this.setState({
          isCool: value
        });
        this.setQuickCool(value, quickTime)
          .then(() => {
          }).catch(() => {
            LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
            this.setState({
              isCool
            });
          });
      }
    }];
    const section2 = [];
    if (isCool) {
      section2.push({
        title: LHLocalizedStrings.mi_acpartner_coolspeed_time_caption,
        rightDescription: (quickTime || defaultQuickTime) + ' ' + LHCommonLocalizableString.common_unit_minute_short,
        bottomSeparatorLine: false,
        press: () => {
          this.setState({
            showPicker: true
          });
        }
      });
    }

    return [{ data: section1 }, { data: section2 }];
  }


  renderFooterView() {
    const { quickTime } = this.state;
    return (
      <View style={footerStyles.footerContainer}>
        <LHSeparator style={{ marginLeft: LHUiUtils.GetPx(24) }} />

        <LHText style={footerStyles.footerTitle}>{LHLocalizedStrings.mi_acpartner_coolspeed_trend_title}</LHText>

        <View style={footerStyles.footerViewContainer}>
          <LHText style={footerStyles.footerTextTemp}>{LHLocalizedStrings.mi_acpartner_coolspeed_indoor_temp}</LHText>
          <LHText style={footerStyles.footerTextLastTemp}>{LHLocalizedStrings.mi_acpartner_coolspeed_last_temp}</LHText>
          <LHText style={footerStyles.footerTextPower}>{LHLocalizedStrings.mi_acpartner_coolspeed_ht_start}</LHText>
          <LHText style={footerStyles.footerText20Left}>20℃</LHText>
          <View style={footerStyles.footerTempMinContainer}>
            <LHText style={footerStyles.footerText20Right}>20℃</LHText>
            <LHText style={footerStyles.footerTextMinute}>{(quickTime || defaultQuickTime) + ' ' + LHCommonLocalizableString.common_unit_minute_short}</LHText>
          </View>
          <View style={footerStyles.footerLineV} />
          <View style={footerStyles.footerLineH} />
          <Image style={footerStyles.footerImage} source={Resources.quickCoolPage.coolCurve} resizeMode="stretch" />
        </View>

        <LHSeparator />
      </View>
    );
  }

  getPickerTimeData() {
    const { min, max } = this.state;
    const result = [];
    for (let index = min; index <= max; index += 1) {
      result.push('' + index);
    }
    return result;
  }

  render() {
    const { isCool, quickTime, showPicker } = this.state;
    const pageData = this.getPageData();
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: LHUiUtils.MiJiaBackgroundGray
        }}
      >
        <LHStandardList
          ListFooterComponent={isCool ? this.renderFooterView() : null}
          data={pageData}
        />

        <LHStringModalPicker
          unit={LHCommonLocalizableString.common_unit_minute_short}
          show={showPicker}
          dataSource={this.getPickerTimeData()}
          title={LHLocalizedStrings.mi_acpartner_coolspeed_time_caption}
          defaultValue={'' + quickTime}
          onSelected={(value) => {
            const { isCool: isCoolValue, quickTime: quickTimeValue } = this.state;
            const { newValue } = value;
            this.setState({ quickTime: Number(newValue) });
            this.setQuickCool(isCoolValue, Number(newValue))
              .then(() => {
              }).catch(() => {
                LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
                this.setState({ quickTime: Number(quickTimeValue) });
              });
          }}
          onClose={() => {
            this.setState({ showPicker: false });
          }}
        />

      </View>
    );
  }
}

export default LHPureRenderDecorator(LHQuickCoolPage);