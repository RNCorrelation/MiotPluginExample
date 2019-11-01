/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-04 10:40:30
 * @LastEditors: nicolas
 * @LastEditTime: 2019-10-14 12:16:27
 */
import React from 'react';
import { View } from 'react-native';
import {
  LHTitleBarCustom, LHStandardListSwipeout, LHSeparator
} from 'LHCommonUI';
import {
  LHUiUtils, LHTimeSpanUtils, LHToastUtils, LHDialogUtils, LHCommonLocalizableString
} from 'LHCommonFunction';
import PluginConfig from 'PluginConfig';
import MHDatePicker from 'miot/ui/MHDatePicker';
import ChoiceDialog from 'miot/ui/Dialog/ChoiceDialog';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LHStatusUtils from '../../../Utils/LHStatueUtils';
import LHCommonStyle from '../../../Styles/LHCommonStyle';
import LHNightLightSceneManager from '../IFTTT/LHTimerIFTTTManager';
import LHLocalizedStrings from '../../../Localized/LHLocalizableString';
import { STATE_POWER_OFF } from '../../../Model/LHAcDefine';
import UpdateRemoteModelActions from '../../../Redux/Actions/RemoteModel';
import Resources from '../../../../Resources';

let Instance = null;
class LHTimeEditPage extends React.Component {
  static navigationOptions = () => {
    return {
      header: null
    };
  }

  constructor(props) {
    super(props);
    Instance = this;
    const { navigation } = this.props;
    const { timeItem, isCreate } = navigation.state.params;
    this.isCreatingTimer = false;
    this.disable = true;
    this.isStartTimeSeted = !isCreate;
    this.isEndTimeSeted = !isCreate;
    this.time = LHTimeSpanUtils.getSceneTimerSpan(timeItem.setting.on_time, timeItem.setting.off_time, timeItem.setting.enable_timer_on, timeItem.setting.enable_timer_off, !isCreate);
    this.state = ({
      isShowStartDialog: false,
      isShowEndDialog: false,
      isShowRepeatDialog: false,
      isShowRepeatCustomDialog: false,
      startTime: LHCommonLocalizableString.timersetting_empty,
      endTime: LHCommonLocalizableString.timersetting_empty,
      status: timeItem.setting.on_param
    });
  }

  componentWillMount() {
    const { navigation } = this.props;
    const { timeItem } = navigation.state.params;
    if (timeItem === undefined) {
      return;
    }
    this.showTime();
  }

  setRepeatFromPosition(position) {
    switch (position) {
      case 0:
        this.time.timeSpan.wday = [];
        break;
      case 1:
        this.time.timeSpan.wday = [0, 1, 2, 3, 4, 5, 6];
        break;
      case 2:
        this.time.timeSpan.wday = [1, 2, 3, 4, 5];
        break;
      case 3:
        this.time.timeSpan.wday = [0, 6];
        break;
      default:
    }
  }

  showStartTimePickDialog() {
    const { isShowStartDialog } = this.state;
    return (
      <MHDatePicker
        visible={isShowStartDialog}
        confirmColor={PluginConfig.MainColor}
        title={LHCommonLocalizableString.timersetting_on}
        current={[this.time.timeSpan.from.hour, this.time.timeSpan.from.min]}
        type={MHDatePicker.TYPE.TIME24}
        onSelect={(res) => {
          this.time.timeSpan.from.hour = Number(res.rawArray[0]);
          this.time.timeSpan.from.min = Number(res.rawArray[1]);
          this.isStartTimeSeted = true;
          this.showTime();
        }}
        onDismiss={() => {
          this.setState({
            isShowStartDialog: false
          });
        }}
      />
    );
  }

  showEndTimePickDialog() {
    const { isShowEndDialog } = this.state;
    return (
      <MHDatePicker
        visible={isShowEndDialog}
        confirmColor={PluginConfig.MainColor}
        title={LHCommonLocalizableString.timersetting_off}
        current={[this.time.timeSpan.to.hour, this.time.timeSpan.to.min]}
        type={MHDatePicker.TYPE.TIME24}
        onSelect={(res) => {
          this.time.timeSpan.to.hour = Number(res.rawArray[0]);
          this.time.timeSpan.to.min = Number(res.rawArray[1]);
          this.isEndTimeSeted = true;
          this.showTime();
        }}
        onDismiss={() => {
          this.setState({
            isShowEndDialog: false
          });
        }}
      />
    );
  }

  showRepeatDialog() {
    const choiceDialogData = LHNightLightSceneManager.getChoiceDialogData(1, this.time.timeSpan, null);
    const { isShowRepeatDialog } = this.state;
    return (
      <ChoiceDialog
        visible={isShowRepeatDialog}
        title={choiceDialogData.title}
        type={choiceDialogData.type}
        options={choiceDialogData.options}
        selectedIndexArray={choiceDialogData.selectedIndexArray}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        onDismiss={() => {
          this.setState({
            isShowRepeatDialog: false
          });
        }}
        onSelect={(result) => {
          if (result[0] === 4) {
            this.setState({
              isShowRepeatCustomDialog: true
            });
          } else {
            this.setRepeatFromPosition(result[0]);
          }
          this.setState({
            isShowRepeatDialog: false
          });
          this.showTime();
        }}
      />
    );
  }

  showRepeatCustomDialog() {
    const choiceDialogData = LHNightLightSceneManager.getChoiceDialogData(2, this.time.timeSpan, null);
    const { isShowRepeatCustomDialog } = this.state;
    return (
      <ChoiceDialog
        visible={isShowRepeatCustomDialog}
        title={choiceDialogData.title}
        type={choiceDialogData.type}
        options={choiceDialogData.options}
        color={PluginConfig.MainColor}
        selectedIndexArray={choiceDialogData.selectedIndexArray}
        onDismiss={() => {
          this.setState({
            isShowRepeatCustomDialog: false
          });
        }}
        buttons={[
          {
            style: { fontSize: LHUiUtils.GetPx(14) },
            text: LHCommonLocalizableString.common_cancel,
            callback: () => {
              this.setState({
                isShowRepeatCustomDialog: false
              });
            }
          },
          {
            text: LHCommonLocalizableString.common_ok,
            style: { color: PluginConfig.MainColor, fontSize: LHUiUtils.GetPx(14) },
            callback: (result) => {
              const res = [];
              for (let i = 0; i < result.length; i += 1) {
                if (result[i] === 6) {
                  res.push(0);
                } else {
                  res.push(result[i] + 1);
                }
              }
              this.time.timeSpan.wday = res;
              this.setState({
                isShowRepeatCustomDialog: false
              });
              this.showTime();
            }
          }
        ]}
      />
    );
  }

  showErrorToast() {
    const { Remote } = this.props;
    LHToastUtils.showLongToast(LHCommonLocalizableString.common_tips_request_failed);
  }

  save() {
    const { navigation } = this.props;
    const { timeItem } = navigation.state.params;
    const { status } = this.state;

    const commitTime = this.time;

    if (this.isCreatingTimer) {
      return;
    }

    // 判断开始时间是否在结束时间之后
    if (((timeItem.setting.enable_timer_on === '1') && this.isStartTimeSeted) && ((timeItem.setting.enable_timer_off === '1') && this.isEndTimeSeted)) {
      if (commitTime.timeSpan.wday.length === 0) {
        const isStartTimeTomorrow = LHNightLightSceneManager.isTimeSetToTomorrow(commitTime.timeSpan.from.hour, commitTime.timeSpan.from.to);
        const isEndTimeTomorrow = LHNightLightSceneManager.isTimeSetToTomorrow(commitTime.timeSpan.to.hour, commitTime.timeSpan.to.min);
        if (isStartTimeTomorrow) {
          if ((commitTime.timeSpan.to.hour * 60 + commitTime.timeSpan.to.min) <= (commitTime.timeSpan.from.hour * 60 + commitTime.timeSpan.from.min)) {
            LHToastUtils.showShortToast(LHLocalizedStrings.mi_linuxHub_timer_light_timer_time_after, {});
            return;
          }
        }
        if (!isStartTimeTomorrow && !isEndTimeTomorrow) {
          if ((commitTime.timeSpan.to.hour * 60 + commitTime.timeSpan.to.min) <= (commitTime.timeSpan.from.hour * 60 + commitTime.timeSpan.from.min)) {
            LHToastUtils.showShortToast(LHLocalizedStrings.mi_linuxHub_timer_light_timer_time_after, {});
            return;
          }
        }
      } else if ((commitTime.timeSpan.to.hour * 60 + commitTime.timeSpan.to.min) <= (commitTime.timeSpan.from.hour * 60 + commitTime.timeSpan.from.min)) {
        LHToastUtils.showShortToast(LHLocalizedStrings.mi_acpartner_timer_light_timer_time_after, {});
        return;
      }
    }

    const time = LHTimeSpanUtils.getTimeSlotToCloud(
      commitTime.timeSpan,
      ((timeItem.setting.enable_timer_on === '1') && this.isStartTimeSeted),
      ((timeItem.setting.enable_timer_off === '1') && this.isEndTimeSeted)
    );
    timeItem.setting = {
      enable_push: '1',
      on_time: time.fromTime,
      off_time: time.toTime,
      off_method: 'set_ac',
      off_param: STATE_POWER_OFF,
      on_method: 'set_ac',
      on_param: status,
      enable_timer_on: timeItem.setting.enable_timer_on === '1' ? (this.isStartTimeSeted ? '1' : '0') : '0',
      enable_timer_off: timeItem.setting.enable_timer_off === '1' ? (this.isEndTimeSeted ? '1' : '0') : '0',
      enable_timer: timeItem.setting.enable_timer
    };
    LHDialogUtils.LoadingDialogShow({ title: LHCommonLocalizableString.common_log_loading_with_dot });
    this.isCreatingTimer = true;
    LHNightLightSceneManager.editTimerScene(timeItem, () => {
      this.isCreatingTimer = false;
      LHDialogUtils.LoadingDialogHide();
      const { update } = navigation.state.params;
      update();
      navigation.goBack();
    }, () => {
      this.isCreatingTimer = false;
      LHDialogUtils.LoadingDialogHide();
      this.showErrorToast();
    });
  }

  checkWeekArray(wday) {
    if (wday.length !== this.time.timeSpan.wday.length) {
      return false;
    } else {
      for (let i = 0; i < wday.length; i += 1) {
        if (this.time.timeSpan.wday.indexOf(wday[i]) === -1) {
          return false;
        }
      }
      return true;
    }
  }

  back() {
    const { navigation } = this.props;
    const { timePass } = navigation.state.params;
    if (!timePass && this.isSameData()) {
      navigation.goBack();
    } else {
      LHDialogUtils.MessageDialogShow({
        messageStyle: { textAlign: 'center' },
        title: LHLocalizedStrings.mi_acpartner_go_back_title,
        message: LHLocalizedStrings.mi_acpartner_go_back_content,
        confirm: LHCommonLocalizableString.common_ok,
        cancel: LHCommonLocalizableString.common_cancel,
        onConfirm: () => {
          navigation.goBack();
        }
      });
    }
  }

  isSameData() {
    const { navigation } = this.props;
    const { timeItem, isCreate } = navigation.state.params;
    const { status } = this.state;
    const time = LHTimeSpanUtils.getSceneTimerSpan(timeItem.setting.on_time, timeItem.setting.off_time, timeItem.setting.enable_timer_on, timeItem.setting.enable_timer_off, !isCreate);
    if ((timeItem.setting.enable_timer_on === '1' && this.isStartTimeSeted) || (timeItem.setting.enable_timer_off === '1' && this.isEndTimeSeted)) {
      if (isCreate) {
        return false;
      }
    }
    const result = ((time.timeSpan.to.min === this.time.timeSpan.to.min)
    && (time.timeSpan.to.hour === this.time.timeSpan.to.hour)
    && (time.timeSpan.from.min === this.time.timeSpan.from.min)
    && (time.timeSpan.from.hour === this.time.timeSpan.from.hour)
    && (this.checkWeekArray(time.timeSpan.wday))
    && (timeItem.setting.on_param === status));
    return result;
  }

  showTime() {
    const { navigation } = this.props;
    const { timeItem } = navigation.state.params;
    const isOnce = this.time.timeSpan.wday.length === 0;
    const showTime = LHTimeSpanUtils.gettimerArrayStr(this.time.timeSpan);
    const startTime = timeItem.setting.enable_timer_on === '1' ? showTime[0] : '';
    const endTime = timeItem.setting.enable_timer_off === '1' ? showTime[1] : '';
    const isStartTimeTomorrow = LHNightLightSceneManager.isTimeSetToTomorrow(this.time.timeSpan.from.hour, this.time.timeSpan.from.min);
    const isEndTimeTomorrow = LHNightLightSceneManager.isTimeSetToTomorrow(this.time.timeSpan.to.hour, this.time.timeSpan.to.min);
    const startTimeTimerPrefixString = isOnce ? (isStartTimeTomorrow ? LHCommonLocalizableString.common_repeat_tomorrow : '') : '';
    let endTimeTimerPrefixString = isOnce ? (isEndTimeTomorrow ? LHCommonLocalizableString.common_repeat_tomorrow : '') : '';
    if (timeItem.setting.enable_timer_on === '1') {
      endTimeTimerPrefixString = isOnce ? (isEndTimeTomorrow ? LHCommonLocalizableString.common_repeat_tomorrow : (isStartTimeTomorrow ? LHCommonLocalizableString.common_repeat_tomorrow : '')) : '';
    }
    this.setState({
      startTime: this.isStartTimeSeted ? (startTimeTimerPrefixString + startTime) : LHCommonLocalizableString.timersetting_empty,
      endTime: this.isEndTimeSeted ? (endTimeTimerPrefixString + endTime) : LHCommonLocalizableString.timersetting_empty
    });
  }

  getListData() {
    const { navigation, Remote } = this.props;
    const { timeItem } = navigation.state.params;
    const { startTime, endTime, status } = this.state;
    const dataArr = [];
    const dataArr2 = [];
    const repeatData = {
      title: LHLocalizedStrings.mi_acpartner_timersetting_repeat,
      titleNumberOfLines: 1,
      description: LHNightLightSceneManager.getPeriodStr(this.time.timeSpan, null),
      descriptionStyle: { fontSize: LHUiUtils.GetPx(12) },
      descriptionNumberOfLines: 1,
      hideRightArrow: false,
      hasSwitch: false,
      press: () => {
        this.setState({
          isShowRepeatDialog: true
        });
      }
    };
    dataArr.push(repeatData);
    const startTimeView = {
      title: LHCommonLocalizableString.common_open,
      titleNumberOfLines: 1,
      description: startTime,
      descriptionStyle: { fontSize: LHUiUtils.GetPx(12) },
      descriptionNumberOfLines: 1,
      hideRightArrow: false,
      hasSwitch: false,
      press: () => {
        this.setState({
          isShowStartDialog: true
        });
      }
    };
    if (timeItem.setting.enable_timer_on === '1') {
      dataArr.push(startTimeView);
    }
    const endTimeView = {
      title: LHCommonLocalizableString.common_close,
      titleNumberOfLines: 1,
      description: endTime,
      descriptionStyle: { fontSize: LHUiUtils.GetPx(12) },
      descriptionNumberOfLines: 1,
      hideRightArrow: false,
      hasSwitch: false,
      press: () => {
        this.setState({
          isShowEndDialog: true
        });
      }
    };
    if (timeItem.setting.enable_timer_off === '1') {
      dataArr.push(endTimeView);
    }

    const workStatusView = {
      title: LHLocalizedStrings.mi_acpartner_timer_workstatue,
      titleNumberOfLines: 1,
      description: LHStatusUtils.getStatue(status, Remote, false).description,
      descriptionStyle: { fontSize: LHUiUtils.GetPx(12) },
      descriptionNumberOfLines: 1,
      hideRightArrow: false,
      hasSwitch: false,
      press: () => {
        navigation.navigate('LHTimeWorkStatePage', {
          status,
          back: (data) => {
            this.setState({
              status: data
            });
          }
        });
      }
    };
    const listData = [{ data: dataArr }];
    if (this.isStartTimeSeted && timeItem.setting.enable_timer_on === '1') {
      dataArr2.push(workStatusView);
      listData.push({
        sectionHeader: () => {
          return (
            <View>
              <View style={{ height: LHUiUtils.GetPx(8) }} />
              <LHSeparator />
            </View>
          );
        },
        data: dataArr2
      });
    }
    return listData;
  }

  render() {
    const { navigation } = this.props;
    const timePass = navigation.getParam('timePass');
    if (this.isSameData()) {
      this.disable = true;
    } else if (!this.isStartTimeSeted && !this.isEndTimeSeted) {
      this.disable = true;
    } else {
      this.disable = false;
    }
    return (
      <View style={LHCommonStyle.pageGrayStyle}>
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_timer_setting}
            style={[LHCommonStyle.navigatorWithBorderBotoom]}
            rightButtons={[{
              disable: timePass ? false : this.disable,
              type: 'deafultCompleteBtn',
              press: () => {
                if (timePass || !this.disable) {
                  Instance.save();
                }
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
        <LHStandardListSwipeout
          data={this.getListData()}
        />
        {this.showStartTimePickDialog()}
        {this.showEndTimePickDialog()}
        {this.showRepeatDialog()}
        {this.showRepeatCustomDialog()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Remote: state.RemoteModelReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Object.assign({}, UpdateRemoteModelActions), dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LHTimeEditPage);