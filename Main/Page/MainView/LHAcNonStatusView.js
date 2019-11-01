/* eslint-disable camelcase */
/*
 * File: LHAcNonStatusView.js
 * Project: com.lumi.acparnter
 * File Created: Tuesday, 3rd September 2019 10:05:02 am
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import React, { Component } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import {
  LHText, LHCardBase,
  LHSelectCard, LHHTPCard
} from 'LHCommonUI';
import {
  LHUiUtils, LHElectricityDataManager, LHDeviceUtils, LHToastUtils, LHCommonLocalizableString
} from 'LHCommonFunction';
import Host from 'miot/Host';
import Resources from '../../../Resources';
import LHAcNonCmdSender from '../../Command/LHAcNonCmdSender';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';
import {
  kNONE_AC_POWER_TOGGLE_KEY,
  kNONE_AC_TEMP_PLUS_KEY,
  kNONE_AC_TEMP_MINUS_KEY
} from '../../Model/LHAcDefine';

const styles = StyleSheet.create({
  header: {
    height: LHUiUtils.GetPx(300),
    alignItems: 'center'
  },
  headerTitle: {
    color: '#fff',
    fontSize: LHUiUtils.GetPx(76),
    marginTop: LHUiUtils.GetPx(82)
  },
  headerTitleUnit: {
    color: '#fff',
    fontSize: LHUiUtils.GetPx(18),
    paddingBottom: LHUiUtils.GetPx(20)
  },
  headerSubtitle: {
    position: 'absolute',
    color: '#ffffff',
    opacity: 0.8,
    fontSize: LHUiUtils.GetPx(12),
    bottom: LHUiUtils.GetPx(97),
    alignSelf: 'center'
  },
  headerSubtitleSend: {
    position: 'absolute',
    bottom: LHUiUtils.GetPx(20),
    fontSize: LHUiUtils.GetPx(10),
    lineHeight: LHUiUtils.GetPx(13),
    alignSelf: 'center',
    color: '#FFFFFF',
    opacity: 0.5
  },
  tempCard: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: LHUiUtils.GetPx(116),
    borderRadius: LHUiUtils.GetPx(10),
    marginTop: LHUiUtils.GetPx(10),
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10)
  },
  tempCardInner: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  tempTitle: {
    color: '#333',
    fontSize: LHUiUtils.GetPx(14),
    width: LHUiUtils.GetPx(136),
    alignSelf: 'center',
    textAlign: 'center'
  },
  headerImage: {
    height: LHUiUtils.GetPx(198),
    width: LHUiUtils.GetPx(310),
    alignSelf: 'center',
    marginTop: LHUiUtils.GetPx(60),
    marginBottom: LHUiUtils.GetPx(43)
  }
});

class LHAcNonStatusView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSending: false
    };
  }


  // MARK: 按键
  renderKeysCard() {
    const { Remote } = this.props;
    const arr = Remote.remoteModel.keys;

    const cardData = Array.isArray(arr) && arr.filter((value) => {
      const { name } = value;
      // 过滤开关和温度加减按键
      if (name === kNONE_AC_POWER_TOGGLE_KEY
        || name === kNONE_AC_TEMP_PLUS_KEY
        || name === kNONE_AC_TEMP_MINUS_KEY) {
        return false;
      }
      return true;
    }).map((value) => {
      const { id, name, display_name } = value;

      return {
        text: Host.locale.language === 'zh' ? display_name : name,
        icon: Resources.homePageIcon.defaultKey,
        activeIcon: Resources.homePageIcon.defaultKey,
        onPress: () => {
          this.setState({ isSending: true });
          LHAcNonCmdSender.sendNonCommandWithId(id, Remote)
            .then(() => {
              this.setState({ isSending: false });
            })
            .catch(() => {
              LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
              this.setState({ isSending: false });
            });
        }
      };
    });
    return (Array.isArray(cardData) && cardData.length >= 2) ? (
      <LHSelectCard
        data={cardData}
        activeOpacity={0.2}
        cardStyle={{ marginTop: LHUiUtils.GetPx(10), marginBottom: LHUiUtils.GetPx(10) }}
      />
    ) : null;
  }

  // MARK: 开关
  renderPowerCard() {
    const { Remote } = this.props;
    return (
      <LHCardBase
        data={[{
          title: LHLocalizedStrings.mi_acpartner_switch_onoff,
          iconSource: Resources.homePageIcon.powerOn,
          hideRightIcon: true,
          onPress: () => {
            this.setState({ isSending: true });
            LHAcNonCmdSender.controlNonPower(Remote)
              .then(() => {
                this.setState({ isSending: false });
              })
              .catch(() => {
                LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
                this.setState({ isSending: false });
              });
          }
        }]}
        cardStyle={{ height: LHUiUtils.GetPx(80) }}
      />
    );
  }

  // MARK: 温度
  renderTempCard() {
    const { Remote } = this.props;
    return (
      <View style={styles.tempCard}>
        <View style={styles.tempCardInner}>

          <TouchableOpacity
            onPress={() => {
              this.setState({ isSending: true });
              LHAcNonCmdSender.controlTempDown(Remote)
                .then(() => {
                  this.setState({ isSending: false });
                })
                .catch(() => {
                  LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
                  this.setState({ isSending: false });
                });
            }}
          >
            <Image
              style={{ width: LHUiUtils.GetPx(56), height: LHUiUtils.GetPx(56) }}
              source={Resources.homePageIcon.tempMinus}
            />
          </TouchableOpacity>

          <LHText style={styles.tempTitle}>{LHLocalizedStrings.mi_acpartner_temperature_control}</LHText>

          <TouchableOpacity
            onPress={() => {
              this.setState({ isSending: true });
              LHAcNonCmdSender.controlTempUp(Remote)
                .then(() => {
                  this.setState({ isSending: false });
                })
                .catch(() => {
                  LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
                  this.setState({ isSending: false });
                });
            }}
          >
            <Image
              style={{ width: LHUiUtils.GetPx(56), height: LHUiUtils.GetPx(56) }}
              source={Resources.homePageIcon.tempPlug}
            />
          </TouchableOpacity>

        </View>
      </View>
    );
  }

  // MARK: header
  renderHeaderView() {
    const { powerData, isShowElecCard } = this.props;
    const { isSending } = this.state;

    if (!isShowElecCard) {
      return (
        <Image
          source={Resources.homePageIcon.nonStatusHeader}
          style={styles.headerImage}
        />
      );
    }
    const isPowerValid = (elec) => {
      if (elec === undefined || elec === '' || elec === null) { return false; }
      return true;
    };
    const formatedNum = isPowerValid(powerData) ? LHElectricityDataManager.formatPowerNumber(powerData || 0) : '-/-';
    return (
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <LHText style={[styles.headerTitle]}>{formatedNum}</LHText>
          {isPowerValid(powerData) ? (<LHText style={[styles.headerTitleUnit]}>{LHCommonLocalizableString.comon_unit_w}</LHText>) : null}
        </View>
        <LHText style={styles.headerSubtitle}>{LHLocalizedStrings.mi_acpartner_quant_power_no_unit}</LHText>
        {isSending ? (<LHText style={styles.headerSubtitleSend}>{LHLocalizedStrings.mi_acpartner_sending_ir_code_wait}</LHText>) : null}
      </View>
    );
  }

  // MARK: 电量
  renderElectricView() {
    const {
      todayElectricity, monthElectricity, navigation, isShowElecCard
    } = this.props;
    const placeholderElec = '-/-';
    const formateElecTitle = (elec) => {
      if (elec === undefined || elec === '' || elec === null) return placeholderElec;
      return LHElectricityDataManager.formatElectricityNumber(elec || 0);
    };

    if (!isShowElecCard) {
      return null;
    }

    return (
      <LHHTPCard
        cardStyle={{
          height: LHUiUtils.GetPx(115),
          marginBottom: LHUiUtils.GetPx(10)
        }}
        languageAdaptation={false}
        data={[{
          // 日
          title: formateElecTitle(todayElectricity),
          subTitle: LHLocalizedStrings.mi_acpartner_quant_today,
          titleStyle: { fontFamily: formateElecTitle(todayElectricity) === placeholderElec ? LHUiUtils.DefaultFontFamily : LHUiUtils.NumberDefaultFontFamily },
          onPress: () => {
            navigation.navigate('LHCurvePage', { dateActive: 0, title: '', type: 'electricity' });
          }
        },
        {
          // 月
          title: formateElecTitle(monthElectricity),
          subTitle: LHLocalizedStrings.mi_acpartner_quant_month,
          titleStyle: { fontFamily: formateElecTitle(monthElectricity) === placeholderElec ? LHUiUtils.DefaultFontFamily : LHUiUtils.NumberDefaultFontFamily },
          onPress: () => {
            navigation.navigate('LHCurvePage', { dateActive: 2, title: '', type: 'electricity' });
          }
        }]}
      />
    );
  }

  // MARK: render
  render() {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: LHDeviceUtils.AppHomeIndicatorHeight }}
        showsVerticalScrollIndicator={false}
      >

        {this.renderHeaderView()}
        {this.renderElectricView()}
        {this.renderPowerCard()}
        {this.renderTempCard()}
        {this.renderKeysCard()}

      </ScrollView>
    );
  }
}

export {
  LHAcNonStatusView as default
};