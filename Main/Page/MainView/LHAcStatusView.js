/*
 * File: LHAcStatusView.js
 * Project: com.lumi.acparnter
 * File Created: Monday, 2nd September 2019 3:45:33 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import React, { Component } from 'react';
import {
  View,
  ScrollView,
  StyleSheet
} from 'react-native';
import {
  LHText, LHCardBase,
  LHSelectCard, LHProgressCard, LHHTPCard
} from 'LHCommonUI';
import {
  LHUiUtils, LHElectricityDataManager, LHToastUtils, LHCommonLocalizableString, LHDeviceUtils
} from 'LHCommonFunction';
import Resources from '../../../Resources';
import LHAcStatusAsset from '../../Model/LHAcStatusAsset';
import LHLocalizableString from '../../Localized/LHLocalizableString';


class LHAcStatusViewActionKey {
  static onPowerClicked = 'onPowerClicked'

  static onTempClicked = 'onTempClicked'

  static onSwingClicked = 'onSwingClicked'

  static onSwingDirectionClicked = 'onSwingDirectionClicked'

  static onSpeedClicked = 'onSpeedClicked'

  static onModeClicked = 'onModeClicked'

  static onQuickCoolClicked = 'onQuickCoolClicked'

  static onSleepModeClicked = 'onSleepModeClicked'

  static onTimerClicked = 'onTimerClicked'

  static onDelayClicked = 'onDelayClicked'

  static onDayElec = 'onDayElec'

  static onMonthElec = 'onMonthElec'

  static onPowerElec = 'onPowerElec'
}


const styles = StyleSheet.create({
  header: {
    height: LHUiUtils.GetPx(300),
    alignItems: 'center'
  },
  mainTitleContainer: {
    marginTop: LHUiUtils.GetPx(50),
    marginLeft: LHUiUtils.GetPx(20),
    marginRight: LHUiUtils.GetPx(20),
    marginBottom: LHUiUtils.GetPx(8),
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'center'
  },
  mainTitle: {
    fontSize: LHUiUtils.GetPx(120),
    lineHeight: LHUiUtils.GetPx(130),
    fontFamily: LHUiUtils.FontFamilyDDIN,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  mainTitleUnit: {
    marginTop: LHUiUtils.GetPx(18),
    fontSize: LHUiUtils.GetPx(20),
    lineHeight: LHUiUtils.GetPx(27),
    color: '#FFFFFF'
  },
  statusTitle: {
    marginLeft: LHUiUtils.GetPx(20),
    marginRight: LHUiUtils.GetPx(20),
    fontSize: LHUiUtils.GetPx(12),
    lineHeight: LHUiUtils.GetPx(16),
    alignSelf: 'center',
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.8
  },
  quickCoolStatusTitle: {
    marginTop: LHUiUtils.GetPx(6),
    marginRight: LHUiUtils.GetPx(20),
    marginLeft: LHUiUtils.GetPx(20),
    fontSize: LHUiUtils.GetPx(12),
    lineHeight: LHUiUtils.GetPx(16),
    textAlign: 'center',
    alignSelf: 'center',
    color: '#FFFFFF',
    opacity: 0.8
  },
  subTitle: {
    position: 'absolute',
    bottom: LHUiUtils.GetPx(20),
    fontSize: LHUiUtils.GetPx(10),
    lineHeight: LHUiUtils.GetPx(13),
    alignSelf: 'center',
    color: '#FFFFFF',
    opacity: 0.5
  },
  tempSliderTextMin: {
    color: '#ffffff',
    opacity: 0.6,
    fontSize: LHUiUtils.GetPx(12)
  },
  tempSliderTextMax: {
    color: '#B2B2B2',
    fontSize: LHUiUtils.GetPx(12)
  },
  headerTitleMode: {
    marginTop: LHUiUtils.GetPx(90),
    marginLeft: LHUiUtils.GetPx(20),
    marginRight: LHUiUtils.GetPx(20),
    marginBottom: LHUiUtils.GetPx(52),
    fontSize: LHUiUtils.GetPx(40),
    lineHeight: LHUiUtils.GetPx(56),
    textAlign: 'center',
    color: '#FFFFFF'
  },
  tempValue: {
    fontSize: LHUiUtils.GetPx(14),
    color: '#5FA7FE'
  }

});

class LHAcStatusView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canScroll: true
    };
  }

  // MARK: 头部
  renderHeaderView() {
    const {
      Remote, AcStatus, isSendingIrCode, isQuickCooling, isSleeping
    } = this.props;
    const { modeState, temperature } = AcStatus;
    const arr = [];
    if (isQuickCooling) arr.push(LHLocalizableString.mi_acpartner_quick_cooling);
    if (isSleeping) arr.push(LHLocalizableString.mi_acpartner_sleep_modeing);
    const getStateText = arr.join(' | ');

    const titleText = Remote.judgeTempCanControl(modeState) ? (
      <View style={styles.mainTitleContainer}>
        <LHText style={styles.mainTitle}>{temperature}</LHText>
        <LHText style={styles.mainTitleUnit}>℃</LHText>
      </View>
    ) : (
      <LHText style={[styles.headerTitleMode]}>{LHAcStatusAsset.acModeLongDespWithMode(modeState)}</LHText>
    );

    const sendingText = isSendingIrCode ? (
      <LHText style={styles.subTitle}>{LHLocalizableString.mi_acpartner_sending_ir_code_wait}</LHText>
    ) : null;
    return (
      <View style={[styles.header]}>
        {titleText}
        <LHText style={styles.statusTitle}>{LHAcStatusAsset.acAcStatusDeaderDesp(AcStatus, Remote)}</LHText>
        <LHText style={styles.quickCoolStatusTitle}>{getStateText}</LHText>
        {sendingText}
      </View>
    );
  }

  // MARK: 电量
  renderElectricView() {
    const {
      todayElectricity, monthElectricity, powerData, isShowElecCard
    } = this.props;
    const placeholderElec = '-/-';
    const formateElecTitle = (elec) => {
      if (elec === undefined || elec === '' || elec === null) return placeholderElec;
      return LHElectricityDataManager.formatElectricityNumber(elec || 0);
    };
    const isPowerValid = (elec) => {
      if (elec === undefined || elec === '' || elec === null) { return false; }
      return true;
    };
    const formatedNum = isPowerValid(powerData) ? LHElectricityDataManager.formatPowerNumber(powerData || 0) : placeholderElec;

    if (!isShowElecCard) {
      return null;
    }

    return (
      <LHHTPCard
        cardStyle={{
          height: LHUiUtils.GetPx(115), marginBottom: LHUiUtils.GetPx(10)
        }}
        languageAdaptation={false}
        data={[{
          title: formateElecTitle(todayElectricity),
          subTitle: LHLocalizableString.mi_acpartner_quant_today,
          titleStyle: { fontFamily: formateElecTitle(todayElectricity) === placeholderElec ? LHUiUtils.DefaultFontFamily : LHUiUtils.NumberDefaultFontFamily },
          onPress: () => {
            const { onEventAction } = this.props;
            if (typeof onEventAction === 'function') {
              onEventAction({ key: LHAcStatusViewActionKey.onDayElec });
            }
          }
        },
        {
          title: formateElecTitle(monthElectricity),
          subTitle: LHLocalizableString.mi_acpartner_quant_month,
          titleStyle: { fontFamily: formateElecTitle(monthElectricity) === placeholderElec ? LHUiUtils.DefaultFontFamily : LHUiUtils.NumberDefaultFontFamily },
          onPress: () => {
            const { onEventAction } = this.props;
            if (typeof onEventAction === 'function') {
              onEventAction({ key: LHAcStatusViewActionKey.onMonthElec });
            }
          }
        },
        {
          title: formatedNum,
          subTitle: LHLocalizableString.mi_acpartner_quant_power,
          titleStyle: { fontFamily: formatedNum === placeholderElec ? LHUiUtils.DefaultFontFamily : LHUiUtils.NumberDefaultFontFamily },
          onPress: () => {
            const { onEventAction } = this.props;
            if (typeof onEventAction === 'function') {
              onEventAction({ key: LHAcStatusViewActionKey.onPowerElec });
            }
          }
        }]}
      />
    );
  }

  // MARK: 风速
  renderSpeedCard() {
    const { Remote, AcStatus } = this.props;
    const { powerState, modeState, windSpeed } = AcStatus;
    const windArr = Remote.supportedSpeedsWithMode(modeState);

    const windCardData = windArr && windArr.map((speed) => {
      return {
        text: LHAcStatusAsset.acSpeedShortDespWithSpeed(speed),
        icon: LHAcStatusAsset.acSpeedIconWithSpeed(speed).normal,
        activeIcon: LHAcStatusAsset.acSpeedIconWithSpeed(speed).active,
        onPress: () => {
          const { onEventAction } = this.props;
          if (typeof onEventAction === 'function') {
            onEventAction({ key: LHAcStatusViewActionKey.onSpeedClicked, value: speed });
          }
        }
      };
    });
    return (Array.isArray(windCardData) && windCardData.length >= 2) ? (
      <LHSelectCard
        key={'speed_' + windCardData.length}
        title={LHLocalizableString.mi_acpartner_fanspeed}
        disabled={!powerState}
        selectIndex={windArr.indexOf(windSpeed)}
        data={windCardData}
        cardStyle={{ marginBottom: LHUiUtils.GetPx(10) }}
      />
    ) : null;
  }

  // MARK: 模式
  renderModeCard() {
    const { Remote, AcStatus } = this.props;
    const { powerState, modeState } = AcStatus;
    const arr = Remote.supportedModes();
    const cardData = arr && arr.map((value) => {
      return {
        text: LHAcStatusAsset.acModeDespWithMode(value),
        icon: LHAcStatusAsset.acModeIconWithMode(value).normal,
        activeIcon: LHAcStatusAsset.acModeIconWithMode(value).active,
        onPress: () => {
          const { onEventAction } = this.props;
          if (typeof onEventAction === 'function') {
            onEventAction({ key: LHAcStatusViewActionKey.onModeClicked, value });
          }
        }
      };
    });
    return (Array.isArray(cardData) && cardData.length >= 2) ? (
      <LHSelectCard
        key={'temp_' + cardData.length}
        title={LHLocalizableString.mi_acpartner_mode}
        disabled={!powerState}
        selectIndex={arr.indexOf(modeState)}
        data={cardData}
        cardStyle={{ marginBottom: LHUiUtils.GetPx(10) }}
      />
    ) : null;
  }

  // MARK: 开关机
  // eslint-disable-next-line class-methods-use-this
  renderPowerCard() {
    const { AcStatus } = this.props;
    const { powerState } = AcStatus;
    return (
      <LHCardBase
        data={[{
          title: LHLocalizableString.mi_acpartner_switch_onoff,
          iconSource: powerState ? Resources.homePageIcon.powerOn : Resources.homePageIcon.powerOff,
          hideRightIcon: true,
          onPress: () => {
            const { onEventAction } = this.props;
            if (typeof onEventAction === 'function') {
              onEventAction({ key: LHAcStatusViewActionKey.onPowerClicked, value: !powerState });
            }
          }
        }]}
        cardStyle={{ height: LHUiUtils.GetPx(80), marginBottom: LHUiUtils.GetPx(10) }}
      />
    );
  }

  // MARK: 扫风
  renderSwingCard() {
    const { Remote, AcStatus } = this.props;
    const { powerState, swingState } = AcStatus;
    if (!Remote.judgeWindDerectCanControl()) {
      return null;
    }

    return (
      <LHCardBase
        data={[{
          title: LHLocalizableString.mi_acpartner_airswing,
          iconSource: Resources.homePageIcon.swing,
          hideRightIcon: true,
          hasSwitch: true,
          switchValue: !swingState,
          useControlledSwitch: true,
          switchColor: '#5FA7FE',
          disabled: !powerState,
          onValueChange: (value) => {
            const { onEventAction } = this.props;
            if (typeof onEventAction === 'function') {
              onEventAction({ key: LHAcStatusViewActionKey.onSwingClicked, value });
            }
          }
        }]}
        cardStyle={{ height: LHUiUtils.GetPx(80), marginBottom: LHUiUtils.GetPx(10) }}
      />
    );
  }

  // MARK: 风向
  renderSwingDirectionCard() {
    const { AcStatus, isSupportWindDirection } = this.props;
    const { powerState, windDirection } = AcStatus;

    if (!isSupportWindDirection) {
      return null;
    }

    return (
      <LHCardBase
        data={[{
          title: LHLocalizableString.mi_acpartner_wind_direct,
          iconSource: Resources.homePageIcon.swingDirection,
          hideRightIcon: true,
          disabled: !powerState,
          onPress: () => {
            const { onEventAction } = this.props;
            if (typeof onEventAction === 'function') {
              onEventAction({ key: LHAcStatusViewActionKey.onSwingDirectionClicked, value: windDirection });
            }
          }
        }]}
        cardStyle={{ height: LHUiUtils.GetPx(80), marginBottom: LHUiUtils.GetPx(10) }}
      />
    );
  }

  // MARK: 温度
  renderTempCard() {
    const { Remote, AcStatus } = this.props;
    const { modeState, powerState, temperature } = AcStatus;
    if (!Remote.judgeTempCanControl(modeState)) {
      return null;
    }
    const tempArr = Remote.sortedsupportedTempsWithMode(modeState);
    if (!Array.isArray(tempArr) || tempArr.length < 1) {
      console.warn(tempArr + 'invalid temp array');
      return null;
    }

    return (
      <LHProgressCard
        cardStyle={{ marginBottom: LHUiUtils.GetPx(10) }}
        progressTitle={LHLocalizableString.mi_acpartner_temperature_control}
        subTitleUnit="℃"
        value={temperature}
        subTitleStyle={styles.tempValue}
        progressEnable={!!powerState}
        enableBgColor="#DFE2E3"
        enableProgressColor="#5FA7FE"
        disableBgColor="#DFE2E330"
        disableProgressColor="#D1D1D130"
        minValue={tempArr[0]}
        maxValue={tempArr[tempArr.length - 1]}
        minStyle={styles.tempSliderTextMin}
        maxStyle={[styles.tempSliderTextMax, powerState ? null : { color: '#ffffff' }]}
        enabledScroll={(enabled) => {
          this.setState({
            canScroll: enabled
          });
        }}
        changeProgressValue={(value) => {
          const { onEventAction, Remote: remoteModel, AcStatus: status } = this.props;
          const { modeState: currentMode } = status;
          if (!remoteModel.judgeTempCanControl(currentMode, value)) {
            LHToastUtils.showShortToast(LHLocalizableString.mi_acpartner_control_temperature);
            return;
          }
          if (typeof onEventAction === 'function') {
            onEventAction({ key: LHAcStatusViewActionKey.onTempClicked, value });
          }
        }}
      />
    );
  }

  // MARK: 功能列表
  // eslint-disable-next-line class-methods-use-this
  renderFuncList() {
    const { AcStatus, isSharedDevice } = this.props;
    const { powerState } = AcStatus;

    const data = [{
      title: LHLocalizableString.mi_acpartner_coolspeed_caption,
      iconSource: Resources.homePageIcon.quickCool,
      onPress: () => {
        const { onEventAction } = this.props;
        if (typeof onEventAction === 'function') {
          onEventAction({ key: LHAcStatusViewActionKey.onQuickCoolClicked });
        }
      }
    }, {
      title: LHLocalizableString.mi_acpartner_footer_sleepmode,
      iconSource: Resources.homePageIcon.sleepMode,
      onPress: () => {
        const { onEventAction } = this.props;
        if (typeof onEventAction === 'function') {
          onEventAction({ key: LHAcStatusViewActionKey.onSleepModeClicked });
        }
      }
    }];

    if (!isSharedDevice) {
      data.push(...[{
        title: LHCommonLocalizableString.common_timer,
        iconSource: Resources.homePageIcon.timer,
        onPress: () => {
          const { onEventAction } = this.props;
          if (typeof onEventAction === 'function') {
            onEventAction({ key: LHAcStatusViewActionKey.onTimerClicked });
          }
        }
      }, {
        title: LHLocalizableString.mi_acpartner_delay_close_ac,
        iconSource: Resources.homePageIcon.delayOff,
        disabled: !powerState,
        onPress: () => {
          const { onEventAction } = this.props;
          if (typeof onEventAction === 'function') {
            onEventAction({ key: LHAcStatusViewActionKey.onDelayClicked });
          }
        }
      }]);
    }

    return (
      <LHCardBase
        data={data}
        cardStyle={{ height: LHUiUtils.GetPx(80 * data.length), marginBottom: LHUiUtils.GetPx(10) }}
      />
    );
  }

  // MARK: render
  render() {
    const { canScroll } = this.state;
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: LHDeviceUtils.AppHomeIndicatorHeight }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={canScroll}
      >

        {this.renderHeaderView()}
        {this.renderElectricView()}
        {this.renderPowerCard()}

        {this.renderTempCard()}
        {this.renderSpeedCard()}
        {this.renderSwingCard()}
        {this.renderSwingDirectionCard()}
        {this.renderModeCard()}

        {this.renderFuncList()}

      </ScrollView>
    // </LinearGradient>
    );
  }
}

export {
  LHAcStatusView as default,
  LHAcStatusViewActionKey
};