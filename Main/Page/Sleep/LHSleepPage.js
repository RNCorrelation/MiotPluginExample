/*
 * File Created: 2019-09-02 10:07
 * Author: 凌志文 (zhiwen.ling@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import React from 'react';
import {
  ScrollView, View, DeviceEventEmitter
} from 'react-native';
import {
  LHStandardList, LHStandardCell, LHSleepMode, LHText, LHNumberModalPicker
} from 'LHCommonUI';
import {
  LHPureRenderDecorator,
  LHUiUtils,
  LHDeviceUtils,
  LHCommonLocalizableString,
  LHToastUtils,
  LHDialogUtils,
  CommonMethod,
  LHMiServer
} from 'LHCommonFunction';
import ChoiceDialog from 'miot/ui/Dialog/ChoiceDialog';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Resource from 'Resources';
import UpdateRemoteModelActions from '../../Redux/Actions/RemoteModel';
import LHAcStatusAsset from '../../Model/LHAcStatusAsset';
import PluginConfig from '../../PluginConfig';
import LHRpcHost from '../../Host/LHRpcHost';
import LHSleepControl from './LHSleepControl';
import BaseTitleBarPage from '../Base/BaseTitleBarPage';
import LHLocalizableString from '../../Localized/LHLocalizableString';

const WIND_SPEED_CHOICE = 1001;
const SWING_CHOICE = 1002;
const DELAY_TYPE_CHOICE = 1003;
const DELAY_TIME_CHOICE = 1004;
const HIDE_CHOICE = 0;
let MAX_TEMP = 30;
let MIN_TEMP = 16;
let originSleepFunc;

class LHSleepPage extends BaseTitleBarPage {
  constructor(props) {
    super(props);
    this.state = {
      title: LHLocalizableString.mi_acpartner_footer_sleepmode,
      leftButtons: [{
        type: 'deafultCloseBtn',
        press: () => {
          this.onBackPressed();
        }
      }],
      rightButtons: [{
        type: 'deafultCompleteBtn',
        press: () => {
          this.save();
        }
      }],
      sleepStatus: 0,
      timespan: {},
      windSpeed: 0,
      swing: 0,
      delay: 0,
      tempArray: [26, 27, 28, 26],
      choiceDialogVisible: HIDE_CHOICE
    };
    const { Remote } = this.props;
    const supportedTemps = Remote.supportedTempsWithMode(0);
    MIN_TEMP = Math.min(...supportedTemps);
    MAX_TEMP = Math.max(...supportedTemps);
  }

  componentDidMount() {
    super.componentDidMount();
    this.deEmitter = DeviceEventEmitter.addListener('sleepTimer', (res) => {
      console.log(res);
      this.setState({ timespan: res });
      this.forceUpdate();
    });

    this.restoreAcSleepCache()
      .then((res) => {
        if (res) {
          this.loadSleepFunc(res);
        }
      });

    LHRpcHost.getSleepFunc().then((res) => {
      console.log(res);
      this.loadSleepFunc(res);
      this.saveAcSleepCache(res);
    }).catch(() => {
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
    });
  }

  restoreAcSleepCache = () => {
    return LHMiServer.GetHostStorage(PluginConfig.SleepCacheKey);
  };

  // eslint-disable-next-line class-methods-use-this
  saveAcSleepCache = (arr) => {
    LHMiServer.SetHostStorage(PluginConfig.SleepCacheKey, arr);
  };

  loadSleepFunc = (res) => {
    originSleepFunc = LHSleepControl.parseSleepFunc(res);
    const {
      sleepStatus,
      timespan,
      delay,
      tempArray,
      windSpeed,
      swing
    } = originSleepFunc;
    const originTempArray = CommonMethod.DeepClone(tempArray, []);
    const tArray = originTempArray.map((temp) => {
      if (temp > MAX_TEMP) {
        return MAX_TEMP;
      }
      if (temp < MIN_TEMP) {
        return MIN_TEMP;
      }
      return temp;
    });
    let supportedWindSpeed;
    let supportedSwing;
    const { Remote } = this.props;
    const supportedSpeeds = Remote.supportedSpeedsWithMode(0);
    if (Remote.judgeWindDerectCanControl()) {
      supportedSwing = (swing > -1 ? swing : 0);
    }
    if (supportedSpeeds
      && supportedSpeeds.length > 0) {
      if (supportedSpeeds.includes(windSpeed)) {
        supportedWindSpeed = windSpeed;
      } else {
        // eslint-disable-next-line prefer-destructuring
        supportedWindSpeed = supportedSpeeds[0];
      }
    }
    this.setState({
      sleepStatus, timespan: Object.assign({}, timespan), delay, tempArray: tArray, windSpeed: supportedWindSpeed, swing: supportedSwing
    });
    /**
     * 根据当前码库范围就近原则更改安睡参数，且弹窗提示：
     */
    if (windSpeed !== supportedWindSpeed
      || swing !== supportedSwing
      || JSON.stringify(tempArray) !== JSON.stringify(tArray)) {
      if (sleepStatus === 1) {
        console.log(swing + ',' + supportedSwing);
        this.resetCodeDialogShow();
      }
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.deEmitter.remove();
  }

  getPageData() {
    const { Remote } = this.props;
    const {
      windSpeed, swing, delay, timespan
    } = this.state;
    const descrPeroid = LHSleepControl.DescOfPeroid(timespan);
    const data = [];
    // 睡眠时段
    data.push({
      title: LHLocalizableString.mi_acpartner_sleepmode_sleep_period,
      description: descrPeroid,
      press: () => {
        const { navigation } = this.props;
        navigation.navigate('LHSleepTimerPage', { timespan });
      }
    });
    // 制冷/制热
    data.push({
      title: LHLocalizableString.mi_acpartner_sleepmode_cool_heat,
      description: LHLocalizableString.mi_acpartner_sleepmode_auto_adapts_mode,
      hideRightArrow: true
    });
    // 风速
    if (Remote.supportedSpeedsWithMode(0) && Remote.supportedSpeedsWithMode(0).length > 0) {
      data.push({
        title: LHLocalizableString.mi_acpartner_fanspeed,
        rightDescription: LHAcStatusAsset.acSpeedDespWithSpeed(windSpeed),
        press: () => {
          this.setState({ choiceDialogVisible: WIND_SPEED_CHOICE });
        }
      });
    }
    // 扫风
    if (Remote.judgeWindDerectCanControl()) {
      data.push(
        {
          title: LHLocalizableString.mi_acpartner_airswing,
          rightDescription: LHAcStatusAsset.acSwingDespWithSwing(swing),
          press: () => {
            this.setState({ choiceDialogVisible: SWING_CHOICE });
          }
        },
      );
    }

    // 睡眠结束后
    data.push({
      title: LHLocalizableString.mi_acpartner_sleepmode_after_sleep,
      rightDescription: delay > 0 ? LHLocalizableString.mi_acpartner_sleepmode_after_turn_off.replace('{value}', delay) : LHLocalizableString.mi_acpartner_sleepmode_keep_status,
      press: () => {
        this.setState({ choiceDialogVisible: DELAY_TYPE_CHOICE });
      }
    });
    return [{ data }];
  }

  /**
   * 支持风速列表拷贝一下，避免改变原数据。
   */
  dialogSelected = (select) => {
    const { choiceDialogVisible } = this.state;
    if (choiceDialogVisible === DELAY_TYPE_CHOICE) {
      if (select[0] === 0) {
        this.setState({ delay: 0, choiceDialogVisible: HIDE_CHOICE });
      } else {
        this.setState({ choiceDialogVisible: DELAY_TIME_CHOICE });
      }
    } else if (choiceDialogVisible === WIND_SPEED_CHOICE) {
      const { Remote } = this.props;
      const speedWinds = Remote.supportedSpeedsWithMode(0);
      const copySpeedWinds = Object.assign([], speedWinds);
      copySpeedWinds.sort((a, b) => {
        const order = [0, 3, 2, 1];
        return order.indexOf(a) - order.indexOf(b);
      });
      this.setState({ windSpeed: copySpeedWinds[select[0]] });
    } else if (choiceDialogVisible === SWING_CHOICE) {
      this.setState({ swing: select[0] });
    }
  };

  /**
   * 支持风速列表拷贝一下，避免改变原数据。
   */
  getChoiceDialogData = (choiceDialogVisible) => {
    const { Remote } = this.props;
    const { windSpeed, swing, delay } = this.state;
    const speedWinds = Remote.supportedSpeedsWithMode(0);
    const copySpeedWinds = Object.assign([], speedWinds);
    const speedDescs = [];
    const swingDescs = Remote.judgeWindDerectCanControl() ? [{ title: LHCommonLocalizableString.common_on }, { title: LHCommonLocalizableString.common_off }] : [];
    if (copySpeedWinds) {
      copySpeedWinds.sort((a, b) => {
        const order = [0, 3, 2, 1];
        return order.indexOf(a) - order.indexOf(b);
      });
      copySpeedWinds.forEach((speed) => {
        speedDescs.push({ title: LHAcStatusAsset.acSpeedDespWithSpeed(speed) });
      });
    }
    if (choiceDialogVisible === WIND_SPEED_CHOICE) {
      return {
        title: LHLocalizableString.mi_acpartner_fanspeed,
        options: speedDescs,
        selectedIndexArray: [copySpeedWinds.indexOf(windSpeed)]
      };
    } else if (choiceDialogVisible === SWING_CHOICE) {
      return { title: LHLocalizableString.mi_acpartner_airswing, options: swingDescs, selectedIndexArray: [swing] };
    } else if (choiceDialogVisible === DELAY_TYPE_CHOICE) {
      return {
        title: LHLocalizableString.mi_acpartner_sleepmode_after_sleep,
        options: [{ title: LHLocalizableString.mi_acpartner_sleepmode_keep_status }, { title: LHLocalizableString.mi_acpartner_sleepmode_turn_off_ac }],
        selectedIndexArray: delay > 0 ? [1] : [0]
      };
    }
    return {};
  };

  onBackPressed = () => {
    const {
      sleepStatus, timespan, delay, tempArray, windSpeed, swing
    } = this.state;
    const currentSleepFunc = {
      sleepStatus, timespan: Object.assign({}, timespan), delay, tempArray
    };
    const { Remote } = this.props;
    if (Remote.supportedSpeedsWithMode(0) && Remote.supportedSpeedsWithMode(0).length > 0) {
      currentSleepFunc.windSpeed = windSpeed;
    }
    if (Remote.judgeWindDerectCanControl()) {
      currentSleepFunc.swing = swing;
    }
    if (LHSleepControl.equalsAsSleepFun(originSleepFunc, currentSleepFunc)) {
      const { navigation } = this.props;
      navigation.goBack();
    } else {
      this.dataChangeDialogShow();
    }
  };

  /**
   * 数据改变提示弹窗
   */
  dataChangeDialogShow = () => {
    LHDialogUtils.MessageDialogShow({
      title: LHLocalizableString.mi_acpartner_go_back_title,
      message: LHLocalizableString.mi_acpartner_sleepmode_exit_modify_tips,
      confirm: LHCommonLocalizableString.common_ok,
      cancel: LHCommonLocalizableString.common_cancel,
      confirmStyle: {
        color: PluginConfig.MainColor
      },
      onConfirm: () => {
        const { navigation } = this.props;
        navigation.goBack();
      }
    });
  }

  /**
   * 换了码库，且之前设置的空调状态不在当前码库的支持范围内。
   */
  resetCodeDialogShow = () => {
    LHDialogUtils.MessageDialogShow({
      message: LHLocalizableString.mi_acpartner_sleep_reset_hint,
      confirm: LHLocalizableString.mi_acpartner_dialog_ok,
      confirmStyle: {
        color: PluginConfig.MainColor
      },
      onConfirm: () => {
      }
    });
  }

  save = () => {
    const {
      sleepStatus,
      timespan,
      delay,
      tempArray,
      windSpeed,
      swing
    } = this.state;
    const { Remote } = this.props;
    const sleepFunc = LHSleepControl.buildSleepFunc({
      sleepStatus, timespan, delay, tempArray, windSpeed, swing
    }, Remote);
    LHDialogUtils.LoadingDialogShow({ title: LHCommonLocalizableString.common_log_loading });
    LHRpcHost.setSleepFunc(sleepFunc).then(() => {
      this.saveAcSleepCache(sleepFunc);
      LHDialogUtils.LoadingDialogHide();
      const { navigation } = this.props;
      navigation.goBack();
    }).catch(() => {
      LHDialogUtils.LoadingDialogHide();
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
    });
  };

  getContentView = () => {
    const {
      choiceDialogVisible, scrollEnabled, tempArray, sleepStatus, timespan, delay
    } = this.state;

    const {
      title, options, selectedIndexArray
    } = this.getChoiceDialogData(choiceDialogVisible);

    const peroidArray = LHSleepControl.peroidArray(timespan);
    const pageData = this.getPageData();

    const contentView = sleepStatus === 1 ? (
      <View>
        <LHStandardList
          style={{ marginTop: LHUiUtils.GetPx(8) }}
          data={pageData}
        />
        <LHSleepMode
          style={{
            marginTop: LHUiUtils.GetPx(8)
          }}
          max={MAX_TEMP}
          min={MIN_TEMP}
          time={peroidArray}
          value={tempArray}
          touchEnd={(index, value) => {
            const { tempArray: newValue } = this.state;
            newValue[index] = value;
            console.log('touchEnd ', newValue);
            this.setState({
              scrollEnabled: true
            });
          }}
          onChange={(index, value) => {
            const { tempArray: newValue } = this.state;
            newValue[index] = value;
            console.log('onChange ', value);
          }}
          touchStart={() => {
            console.log('touchStart');
            this.setState({
              scrollEnabled: false
            });
          }}
        />
        <LHText style={{
          color: LHUiUtils.MiJiaDescriptionColor,
          fontSize: LHUiUtils.GetPx(12),
          marginTop: LHUiUtils.GetPx(10),
          marginLeft: LHUiUtils.GetPx(24),
          marginRight: LHUiUtils.GetPx(24),
          marginBottom: (LHUiUtils.GetPx(40) + LHDeviceUtils.AppHomeIndicatorHeight)
        }}
        >
          {LHLocalizableString.mi_acpartner_sleepmode_bottom_tips}
        </LHText>
      </View>
    ) : null;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: LHUiUtils.MiJiaBackgroundGray
        }}
      >
        <ScrollView
          scrollEnabled={scrollEnabled}
        >
          <LHStandardCell
            title={LHLocalizableString.mi_acpartner_footer_sleepmode}
            description={LHLocalizableString.mi_acpartner_sleepmode_turn_on_sleep_tips}
            bottomSeparatorLine
            bottomSeparatorStyle={{
              marginLeft: 0
            }}
            hasSwitch
            useControlledSwitch
            switchValue={sleepStatus === 1}
            switchColor={PluginConfig.MainColor}
            onSwitchChange={(res) => {
              this.setState({ sleepStatus: res ? 1 : 0 });
            }}
          />
          {contentView}
        </ScrollView>
        <ChoiceDialog
          visible={(choiceDialogVisible === WIND_SPEED_CHOICE || choiceDialogVisible === SWING_CHOICE || choiceDialogVisible === DELAY_TYPE_CHOICE)}
          title={title}
          options={options}
          color={PluginConfig.MainColor}
          icon={Resource.TimeImage.selectIcon}
          selectedIndexArray={selectedIndexArray}
          onDismiss={() => {
            this.setState({ choiceDialogVisible: HIDE_CHOICE });
          }}
          onSelect={this.dialogSelected}
        />
        <LHNumberModalPicker
          title={LHLocalizableString.mi_acpartner_sleepmode_delay_turn_off}
          show={choiceDialogVisible === DELAY_TIME_CHOICE}
          minValue={1}
          maxValue={59}
          defaultValue={delay}
          unit={LHCommonLocalizableString.common_date_minute}
          pickerInnerStyle={{
            selectTextColor: PluginConfig.MainTextcolor,
            unitTextColor: PluginConfig.MainTextcolor,
            selectBgColor: PluginConfig.SelectBgColor,
            lineColor: PluginConfig.PickerLineColor
          }}
          cancelStyle={{ color: LHUiUtils.MiJiaSubTitleColor }}
          okTextStyle={{ color: PluginConfig.MainColor }}
          onClose={() => {
            this.setState({ choiceDialogVisible: HIDE_CHOICE });
          }}
          onSelected={(data) => {
            this.setState({ delay: Number(data.newValue), choiceDialogVisible: HIDE_CHOICE });
          }}
        />
      </View>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    Remote: state.RemoteModelReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Object.assign({}, UpdateRemoteModelActions), dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LHPureRenderDecorator(LHSleepPage));