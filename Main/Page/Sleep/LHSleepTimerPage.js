import React from 'react';
import { View, DeviceEventEmitter } from 'react-native';
import {
  LHPureRenderDecorator, LHUiUtils, LHDateUtils, LHToastUtils, LHDialogUtils, LHCommonLocalizableString
} from 'LHCommonFunction';
import {
  LHStandardList,
  LHCommonStyles
} from 'LHCommonUI';
import { ChoiceDialog } from 'miot/ui/Dialog';
import MHDatePicker from 'miot/ui/MHDatePicker';
import PluginConfig from 'PluginConfig';
import Resource from 'Resources';
import LHSleepControl from './LHSleepControl';
import BaseTitleBarPage from '../Base/BaseTitleBarPage';
import LHLocalizableString from '../../Localized/LHLocalizableString';

let Instance;
let originTimespan;
class LHSleepTimerPage extends BaseTitleBarPage {
  constructor(props) {
    super(props);
    Instance = this;
    const { navigation } = this.props;
    console.log(navigation.state.params);
    let { timespan } = navigation.state.params;
    if (!timespan) {
      timespan = {
        from: {
          hour: 23,
          min: 0
        },
        to: {
          hour: 7,
          min: 0
        },
        fromTime: 0,
        toTime: 0,
        wday: [1, 2, 3, 4, 5]
      };
    }
    originTimespan = Object.assign({}, timespan);
    const {
      startTime, endTime, startTimeStr, endTimeStr
    } = LHSleepControl.getSleepPeroidArray(timespan);
    this.state = {
      title: LHLocalizableString.mi_acpartner_sleepmode_sleep_period,
      leftButtons: [{
        type: 'deafultCloseBtn',
        press: () => { this.onBackPressed(); }
      }],
      rightButtons: [{
        type: 'deafultCompleteBtn',
        press: () => { Instance.save(); }
      }],
      datePickerVisible: 0, // 0.不显示 1.定时开启 2.定时关闭
      choiceDialogVisible: 0, // 0.不显示 1.重复选项 2.自定义重复
      startTime, // 开启时间，数组[hour, minute]
      endTime, // 关闭时间，数组[hour, minute]
      startTimeStr, // 开启时间，字符串 'hour:minute'
      endTimeStr, // 关闭时间，字符串 'hour:minute'
      wday: timespan.wday
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateTimerScreen();
  }

  // eslint-disable-next-line class-methods-use-this
  getPageData() {
    const { startTimeStr, endTimeStr, wday } = this.state;
    const data = [];
    // 开启时间
    const open = {
      title: LHLocalizableString.mi_acpartnar_sleep_start_time,
      description: startTimeStr === null ? LHCommonLocalizableString.timersetting_empty : startTimeStr,
      press: () => {
        this.setState({ datePickerVisible: 1 });
      }
    };
    // 关闭时间
    const close = {
      title: LHLocalizableString.mi_acpartnar_sleep_end_time,
      description: endTimeStr === null ? LHCommonLocalizableString.timersetting_empty : endTimeStr,
      press: () => {
        this.setState({ datePickerVisible: 2 });
      }
    };
    // 重复次数
    data.push({
      title: LHLocalizableString.mi_acpartner_timersetting_repeat,
      description: LHSleepControl.DescOfWday(wday),
      hideTopSeparatorLine: true,
      press: () => {
        this.setState({ choiceDialogVisible: 1 });
      }
    });
    data.push(open);
    data.push(close);

    return [{ data }];
  }

  // eslint-disable-next-line class-methods-use-this
  getCurrentTime() {
    const date = new Date();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    return [hour, minute];
  }

  getDatePickerData() {
    const { datePickerVisible, startTime, endTime } = this.state;
    if (datePickerVisible === 1) {
      return {
        title: LHCommonLocalizableString.timersetting_on,
        time: startTime === null ? this.getCurrentTime() : startTime
      };
    } else {
      return {
        title: LHCommonLocalizableString.timersetting_off,
        time: endTime === null ? this.getCurrentTime() : endTime
      };
    }
  }

  getChoiceDialogData() {
    const { choiceDialogVisible, wday } = this.state;
    if (choiceDialogVisible === 1) {
      return {
        title: LHCommonLocalizableString.common_repeat_timer_title,
        type: ChoiceDialog.TYPE.SINGLE,
        selectedIndexArray: [LHSleepControl.IndexOfWday(wday)],
        options: [
          { title: LHCommonLocalizableString.common_repeat_once },
          { title: LHCommonLocalizableString.common_repeat_everyday },
          { title: LHCommonLocalizableString.common_date_workday },
          { title: LHCommonLocalizableString.common_date_weekend },
          { title: LHCommonLocalizableString.common_date_selfdefine }
        ]
      };
    } else {
      return {
        title: LHCommonLocalizableString.common_repeat_self_timer_title,
        type: ChoiceDialog.TYPE.MULTIPLE,
        selectedIndexArray: wday,
        options: [
          { title: LHCommonLocalizableString.common_short_date_sun },
          { title: LHCommonLocalizableString.common_short_date_mon },
          { title: LHCommonLocalizableString.common_short_date_tues },
          { title: LHCommonLocalizableString.common_short_date_wed },
          { title: LHCommonLocalizableString.common_short_date_thur },
          { title: LHCommonLocalizableString.common_short_date_fri },
          { title: LHCommonLocalizableString.common_short_date_sat }
        ]
      };
    }
  }

  selectedDatePicker = (data) => {
    const { datePickerVisible } = this.state;
    const { rawArray, rawString } = data;
    if (datePickerVisible === 1) {
      this.setState({ startTime: rawArray, startTimeStr: rawString }, () => {
        return this.updateTimerScreen();
      });
    } else {
      this.setState({ endTime: rawArray, endTimeStr: rawString }, () => {
        return this.updateTimerScreen();
      });
    }
  };

  /**
   * 更新执行一次的'明天'
   */
  updateTimerScreen() {
    const {
      startTime, endTime, startTimeStr: startStr, endTimeStr: endStr, wday
    } = this.state;
    const fromDate = new Date();
    const toDate = new Date();
    fromDate.setHours(startTime[0]);
    fromDate.setMinutes(startTime[1]);
    fromDate.setSeconds(0);

    toDate.setHours(endTime[0]);
    toDate.setMinutes(endTime[1]);
    toDate.setSeconds(0);
    if (!wday || wday.length === 0) {
      if (LHDateUtils.isBefore(fromDate) || fromDate.getTime() === new Date().getTime()) {
        this.setState({ startTimeStr: (LHCommonLocalizableString.common_repeat_tomorrow + startStr.substring(startStr.length - 5)) });
        this.setState({ endTimeStr: (LHCommonLocalizableString.common_repeat_tomorrow + endStr.substring(endStr.length - 5)) });
      } else if (fromDate.getTime() > toDate.getTime()) {
        console.log(endStr);
        this.setState({ endTimeStr: (LHCommonLocalizableString.common_repeat_tomorrow + endStr.substring(endStr.length - 5)) });
      }
    } else {
      this.setState({ startTimeStr: startStr.substring(startStr.length - 5) });
      this.setState({ endTimeStr: endStr.substring(endStr.length - 5) });
    }
  }

  dialogSelected = (data) => {
    console.warn(data);
    const { choiceDialogVisible } = this.state;
    if (choiceDialogVisible === 1) {
      if (data[0] === 4) {
        this.setState({ choiceDialogVisible: 2 });
      } else {
        this.setState({ wday: LHSleepControl.wdayOfIndex(data[0]) }, () => {
          this.updateTimerScreen();
        });
      }
    }
  };

  renderChoiceDialog(visible, choiceDialogData) {
    const { choiceDialogVisible } = this.state;
    return (
      <ChoiceDialog
        visible={choiceDialogVisible === visible}
        title={choiceDialogData.title}
        type={choiceDialogData.type}
        color={PluginConfig.MainColor}
        options={choiceDialogData.options}
        icon={Resource.TimeImage.selectIcon}
        selectedIndexArray={choiceDialogData.selectedIndexArray}
        onDismiss={() => {
          this.setState({ choiceDialogVisible: 0 });
        }}
        onSelect={this.dialogSelected}
        buttons={[
          {
            text: LHCommonLocalizableString.common_cancel,
            style: { color: LHUiUtils.MiJiaSubTitleColor },
            callback: () => {
              this.setState({
                choiceDialogVisible: 0
              });
            }
          },
          {
            text: LHCommonLocalizableString.common_ok,
            style: { color: PluginConfig.MainColor },
            callback: (result) => {
              this.setState({
                choiceDialogVisible: 0,
                wday: result
              }, () => {
                this.updateTimerScreen();
              });
            }
          }
        ]}
      />
    );
  }

  save() {
    const {
      startTime, endTime, wday
    } = this.state;
    const timespan = {
      from: {
        hour: 23,
        min: 0
      },
      to: {
        hour: 7,
        min: 0
      },
      fromTime: 0,
      toTime: 0,
      wday
    };
    let fromDate = new Date();
    let toDate = new Date();
    fromDate.setHours(startTime[0]);
    fromDate.setMinutes(startTime[1]);
    fromDate.setSeconds(0);

    toDate.setHours(endTime[0]);
    toDate.setMinutes(endTime[1]);
    toDate.setSeconds(0);
    if (!wday || wday.length === 0) {
      if (LHDateUtils.isBefore(fromDate) || fromDate.getTime() === new Date().getTime()) {
        if (fromDate.getTime() > toDate.getTime()) {
          LHToastUtils.showShortToast(LHLocalizableString.mi_acpartner_sleepperiod_start_than_end_time);
          return;
        }
        fromDate = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (fromDate.getTime() > toDate.getTime()) {
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      }
      if ((toDate.getTime() - fromDate.getTime()) < 4 * 60 * 60 * 1000) {
        LHToastUtils.showShortToast(LHLocalizableString.mi_acpartner_sleepmode_must_than_four_hours);
        return;
      }
      timespan.fromTime = Math.floor(fromDate.getTime() / 1000);
      timespan.toTime = Math.floor(toDate.getTime() / 1000);
    } else {
      if (fromDate.getTime() > toDate.getTime()) {
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      }
      if ((toDate.getTime() - fromDate.getTime()) < 4 * 60 * 60 * 1000) {
        LHToastUtils.showShortToast(LHLocalizableString.mi_acpartner_sleepmode_must_than_four_hours);
        return;
      }
      /*eslint-disable*/
      timespan.from.hour = Number(startTime[0]);
      timespan.from.min = Number(startTime[1]);
      timespan.to.hour = Number(endTime[0]);
      timespan.to.min = Number(endTime[1]);
    }
    DeviceEventEmitter.emit('sleepTimer',timespan);
    const {navigation} = this.props;
    navigation.goBack();
  }

  getCurrentTimespan = ()=>{
    const {
      startTime, endTime, wday
    } = this.state;
    const timespan = {
      from: {
        hour: 23,
        min: 0
      },
      to: {
        hour: 7,
        min: 0
      },
      fromTime: 0,
      toTime: 0,
      wday
    };
    let fromDate = new Date();
    let toDate = new Date();
    fromDate.setHours(startTime[0]);
    fromDate.setMinutes(startTime[1]);
    fromDate.setSeconds(0);

    toDate.setHours(endTime[0]);
    toDate.setMinutes(endTime[1]);
    toDate.setSeconds(0);
    if (!wday || wday.length === 0) {
      if (LHDateUtils.isBefore(fromDate) || fromDate.getTime() === new Date().getTime()) {
        fromDate = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (fromDate.getTime() > toDate.getTime()) {
        toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
      }
      timespan.fromTime = Math.floor(fromDate.getTime() / 1000);
      timespan.toTime = Math.floor(toDate.getTime() / 1000);
    } else {
      /*eslint-disable*/
      timespan.from.hour = Number(startTime[0]);
      timespan.from.min = Number(startTime[1]);
      timespan.to.hour = Number(endTime[0]);
      timespan.to.min = Number(endTime[1]);
    }
    return timespan;
  };

  onBackPressed = () => {
    if(LHSleepControl.equalsAsTimespan(originTimespan,this.getCurrentTimespan())){
      const { navigation } = this.props;
      navigation.goBack();
    }else{
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
  }

  getContentView = () => {
    const { datePickerVisible } = this.state;
    const pageData = this.getPageData();
    const datePickerData = this.getDatePickerData();
    const choiceDialogData = this.getChoiceDialogData();
    return (
      <View style={LHCommonStyles.pageGrayStyle}>
        <LHStandardList data={pageData} />
        <MHDatePicker
          visible={datePickerVisible > 0}
          title={datePickerData.title}
          current={datePickerData.time}
          type={MHDatePicker.TYPE.TIME24}
          confirmColor={PluginConfig.MainColor}
          onDismiss={() => { this.setState({ datePickerVisible: 0 }); }}
          onSelect={this.selectedDatePicker}
        />
        {this.renderChoiceDialog(1, choiceDialogData)}
        {this.renderChoiceDialog(2, choiceDialogData)}
      </View>
    );
  }
}

export default LHPureRenderDecorator(LHSleepTimerPage);