/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-09 17:37:20
 * @LastEditors: nicolas
 * @LastEditTime: 2019-10-15 11:23:41
 */
import React from 'react';
import {
  View,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import {
  LHTitleBarCustom, LHStandardEmpty, LHStandardListSwipeout, LHCommonIcon, LHText
} from 'LHCommonUI';
import {
  LHDialogUtils, LHUiUtils, LHMiServer, LHTimeSpanUtils, LHCommonLocalizableString, CommonMethod, LHToastUtils, LHDeviceUtils, LHDateUtils
} from 'LHCommonFunction';
import CommonStyle from 'LHCommonUI/CommonPage/SubDevice/LHSubDeviceListStyle';
import { Device, SceneType } from 'miot';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ActionSheet from 'miot/ui/Dialog/ActionSheet';
import Resource from 'Resources';
import PluginConfig from 'PluginConfig';
import LHStatusUtils from '../../Utils/LHStatueUtils';
import LHCommonStyle from '../../Styles/LHCommonStyle';
import pageSytle from '../../Styles/LHTimeListPageStyle';
import LHNightLightSceneManager from './IFTTT/LHTimerIFTTTManager';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';
import LHJsonUtils from '../../Utils/LHJsonUtils';
import { STATE_POWER_OFF, STATE_POWER_ON } from '../../Model/LHAcDefine';
import UpdateRemoteModelActions from '../../Redux/Actions/RemoteModel';

class LHTimeListPage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_timerlist_title}
            style={[LHCommonStyle.navigatorWithBorderBotoom]}
            onPressLeft={() => {
              navigation.goBack();
            }}
            backBtnIcon="black"
          />
        </View>
      )
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      timeList: [],
      isShow: false
    };
  }

  componentWillMount() {
    this.requestListData();
  }

  getTime(setting, time) {
    const { Remote } = this.props;
    if (time.timeSpan === undefined || time.timeSpan.wday === undefined) {
      return { time: '', description: '' };
    }
    const isTimerOnEnable = setting.enable_timer_on === '1';
    const isTimerOffEnable = setting.enable_timer_off === '1';
    const isShowbBothTime = isTimerOnEnable && isTimerOffEnable;
    const isOnce = time.timeSpan.wday.length === 0;
    const type = isShowbBothTime ? '' : (isTimerOnEnable ? LHCommonLocalizableString.common_open : LHCommonLocalizableString.common_close);

    const showTime = LHTimeSpanUtils.gettimerArrayStr(time.timeSpan);

    const startTimeTimerPrefixString = isOnce ? LHNightLightSceneManager.timerPrefixString(time.fromDate.getDate(), time.fromDate.getMonth()) : '';

    const endTimeTimerPrefixString = isOnce ? LHNightLightSceneManager.timerPrefixString(time.toDate.getDate(), time.toDate.getMonth()) : '';

    const onceOpenDesctiptionOpen = isOnce ? ' | ' + LHDateUtils.DateFormat(LHDateUtils.GetDateFormatter(true), time.fromDate.getTime() / 1000) + ' ' + LHCommonLocalizableString.common_open : '';

    const onceOpenDesctiptionClose = isOnce ? (' | ' + LHDateUtils.DateFormat(LHDateUtils.GetDateFormatter(true), time.toDate.getTime() / 1000) + ' ' + LHCommonLocalizableString.common_close) : '';

    const startTime = isTimerOnEnable ? startTimeTimerPrefixString + showTime[0] : '';

    const endTime = isTimerOffEnable ? endTimeTimerPrefixString + showTime[1] : '';

    let { description } = LHStatusUtils.getStatue(setting.on_param, Remote);

    if (isTimerOffEnable && !isTimerOnEnable) {
      description = '';
    }

    const result = {
      time: startTime + (isShowbBothTime ? '-' : '') + endTime + type + ' | ' + LHNightLightSceneManager.getPeriodStr(time.timeSpan, setting.on_filter) + ((!isTimerOnEnable && isTimerOffEnable) ? onceOpenDesctiptionClose : onceOpenDesctiptionOpen),
      description
    };
    return result;
  }

  getData() {
    const {
      navigation
    } = this.props;
    const deleteComponent = (
      <View style={CommonStyle.deleteComponent}>
        <Image style={CommonStyle.swipeoutImage} source={LHCommonIcon.common.delete.white} />
        <LHText style={CommonStyle.swipeoutText}>{LHCommonLocalizableString.common_button_delete}</LHText>
      </View>
    );
    const { timeList } = this.state;
    const datas = [];
    if (timeList.length === 0) {
      return datas;
    }

    timeList.forEach((timeItem) => {
      if (timeItem.setting) {
        const time = LHTimeSpanUtils.getSceneTimerSpan(timeItem.setting.on_time, timeItem.setting.off_time, timeItem.setting.enable_timer_on, timeItem.setting.enable_timer_off);

        const result = this.getTime(timeItem.setting, time);

        const dataItem = {
          title: result.time,
          useControlledSwitch: true,
          description: result.description,
          descriptionStyle: { fontSize: LHUiUtils.GetPx(12) },
          switchValue: timeItem.enable === '1',
          switchColor: PluginConfig.MainColor,
          hideRightArrow: true,
          hasSwitch: true,
          swipeoutClose: true,
          onSwitchChange: (res1) => {
            timeItem.enable = (res1 ? '1' : '0');
            this.forceUpdate();
            LHNightLightSceneManager.enableTimerScene(res1, timeItem,
              () => {
                this.changeCacheData(timeList);
              },
              () => {
                timeItem.enable = (res1 ? '0' : '1');
                this.forceUpdate();
                this.showErrorToast();
              });
          },
          // 左滑删除.
          swipeoutBtns: [
            {
              component: deleteComponent,
              // 删除
              press: () => {
                LHDialogUtils.MessageDialogShow({
                  messageStyle: { textAlign: 'center' },
                  message: LHLocalizedStrings.mi_acpartner_timerlist_delete,
                  confirm: LHCommonLocalizableString.common_ok,
                  confirmStyle: { color: PluginConfig.MainColor },
                  cancel: LHCommonLocalizableString.common_cancel,
                  onConfirm: () => {
                    LHNightLightSceneManager.removeTimerScene(
                      timeItem,
                      () => {
                        const index = timeList.indexOf(timeItem);
                        if (index > -1) {
                          timeList.splice(index, 1);
                        }
                        this.changeCacheData(timeList);
                        this.forceUpdate();
                      },
                      () => {
                        this.showErrorToast();
                      }
                    );
                  }
                });
              }
            }
          ],
          press: () => {
            const timePass = time.timeSpan.wday.length === 0 && this.istimePass(timeItem, time);
            navigation.navigate('LHTimeEditPage', {
              timeItem,
              isCreate: false,
              timePass,
              update: () => {
                this.requestListData();
              }
            });
          },
          longPress: () => {
            LHDialogUtils.MessageDialogShow({
              messageStyle: { textAlign: 'center' },
              message: LHLocalizedStrings.mi_acpartner_timerlist_delete,
              confirm: LHCommonLocalizableString.common_ok,
              confirmStyle: { color: PluginConfig.MainColor },
              cancel: LHCommonLocalizableString.common_cancel,
              onConfirm: () => {
                LHNightLightSceneManager.removeTimerScene(
                  timeItem,
                  () => {
                    const index = timeList.indexOf(timeItem);
                    if (index > -1) {
                      timeList.splice(index, 1);
                    }
                    this.changeCacheData(timeList);
                    this.forceUpdate();
                  },
                  () => {
                    this.showErrorToast();
                  }
                );
              }
            });
          }
        };
        datas.push(dataItem);
      }
    });
    return [{ data: datas }];
  }

  getRemoteModel() {
    const { Remote } = this.props;
    return JSON.stringify(Remote);
  }

  getStatus() {
    const { AcStatus } = this.props;
    return JSON.stringify(AcStatus);
  }

  changeCacheData(timeList) {
    const { Remote } = this.props;
    const key = CommonMethod.CreatCacheKey('timerworkstatelist');
    const data = JSON.stringify(LHJsonUtils.parseJson(timeList));
    LHMiServer.SetHostStorage(key, data);
  }

  requestListData() {
    const key = CommonMethod.CreatCacheKey('timerworkstatelist');
    LHMiServer.GetHostStorage(key).then((res) => {
      if (res) {
        const list = JSON.parse(res);
        for (let i = 0; i < list.length; i += 1) {
          list[i] = Object.assign(list[i], { enable: list[i].setting.enable_timer });
        }
        this.setState({
          timeList: list
        });
      }
      this.requestNewList(key);
    }).catch(() => {
      this.showErrorToast();
      this.requestNewList(key);
    });
  }

  requestNewList(key) {
    const { Remote } = this.props;
    LHMiServer.LoadSceneList(
      Device.deviceID,
      SceneType.Timer,
      {
        identify: PluginConfig.TimeIdentify
      },
      (res) => {
        if (res || res.length > 0) {
          const data = JSON.stringify(LHJsonUtils.parseJson(res));
          LHMiServer.SetHostStorage(key, data);
          for (let i = 0; i < res.length; i += 1) {
            res[i] = Object.assign(res[i], { enable: res[i].setting.enable_timer });
          }
          this.setState({
            timeList: res
          });
          if (!LHStatusUtils.checkSameRemote(res, Remote) || LHStatusUtils.checkTemprateOutOfSupport(res, Remote)) {
            LHDialogUtils.MessageDialogShow({
              message: LHLocalizedStrings.mi_acpartner_check_same_remote,
              confirm: LHLocalizedStrings.mi_acpartner_dialog_ok,
              confirmStyle: {
                color: PluginConfig.MainColor
              }
            });
          }
        }
      },
      () => {
        this.showErrorToast();
      }
    );
  }

  showErrorToast() {
    const { Remote } = this.props;
    LHToastUtils.showLongToast(LHCommonLocalizableString.common_tips_request_failed);
  }

  istimePass(timeItem, time) {
    const { Remote } = this.props;
    if (timeItem.setting.enable_timer_on === '1' && timeItem.setting.enable_timer_off === '1') {
      return LHNightLightSceneManager.isTimePassedByTime(time.toDate.getTime());
    } else if (timeItem.setting.enable_timer_on === '1' && timeItem.setting.enable_timer_off === '0') {
      return LHNightLightSceneManager.isTimePassedByTime(time.fromDate.getTime());
    } else if (timeItem.setting.enable_timer_on === '0' && timeItem.setting.enable_timer_off === '1') {
      return LHNightLightSceneManager.isTimePassedByTime(time.toDate.getTime());
    }
  }

  render() {
    const {
      Remote,
      navigation
    } = this.props;

    const {
      isShow
    } = this.state;

    const actionSheetView = (
      <ActionSheet
        visible={isShow}
        options={[
          {
            title: LHLocalizedStrings.mi_acpartner_timer_light_timer_light_period,
            onPress: () => {
              const defaultItem = {
                sceneID: 0,
                identify: PluginConfig.TimeIdentify,
                name: PluginConfig.TimeName,
                setting: {
                  enable_timer: '1',
                  enable_timer_off: '1',
                  enable_timer_on: '1',
                  off_method: 'set_ac',
                  off_param: STATE_POWER_OFF,
                  on_method: 'set_ac',
                  on_param: LHStatusUtils.getInitAcStatus(Remote),
                  on_time: '59 9 30 12 *',
                  off_time: '59 9 30 12 *',
                  on_filter: ''
                }
              };
              defaultItem.setting.enable_timer_off = '1';
              defaultItem.setting.enable_timer_on = '1';
              defaultItem.setting.on_time = '0 0 * * 0,1,2,3,4,5,6';
              defaultItem.setting.off_time = '0 0 * * 0,1,2,3,4,5,6';
              this.setState({ isShow: false });
              navigation.navigate('LHTimeEditPage', {
                timeItem: defaultItem,
                isCreate: true,
                update: () => {
                  this.requestListData();
                }
              });
            }
          },
          {
            title: LHLocalizedStrings.mi_acpartner_timer_light_timer_on,
            onPress: () => {
              const defaultItem = {
                sceneID: 0,
                identify: PluginConfig.TimeIdentify,
                name: PluginConfig.TimeName,
                setting: {
                  enable_timer: '1',
                  enable_timer_off: '1',
                  enable_timer_on: '1',
                  off_method: 'set_ac',
                  off_param: STATE_POWER_OFF,
                  on_method: 'set_ac',
                  on_param: LHStatusUtils.getInitAcStatus(Remote),
                  on_time: '59 9 30 12 *',
                  off_time: '59 9 30 12 *',
                  on_filter: ''
                }
              };
              defaultItem.setting.enable_timer_off = '0';
              defaultItem.setting.enable_timer_on = '1';
              defaultItem.setting.on_time = '0 0 * * 0,1,2,3,4,5,6';
              defaultItem.setting.off_time = '0 0 * * 0,1,2,3,4,5,6';
              this.setState({ isShow: false });
              navigation.navigate('LHTimeEditPage', {
                timeItem: defaultItem,
                isCreate: true,
                update: () => {
                  this.requestListData();
                }
              });
            }
          },
          {
            title: LHLocalizedStrings.mi_acpartner_timer_light_timer_off,
            onPress: () => {
              const defaultItem = {
                sceneID: 0,
                identify: PluginConfig.TimeIdentify,
                name: PluginConfig.TimeName,
                setting: {
                  enable_timer: '1',
                  enable_timer_off: '1',
                  enable_timer_on: '1',
                  off_method: 'set_ac',
                  off_param: STATE_POWER_OFF,
                  on_method: 'set_ac',
                  on_param: LHStatusUtils.getInitAcStatus(Remote),
                  on_time: '59 9 30 12 *',
                  off_time: '59 9 30 12 *',
                  on_filter: ''
                }
              };
              defaultItem.setting.enable_timer_off = '1';
              defaultItem.setting.enable_timer_on = '0';
              defaultItem.setting.on_time = '0 0 * * 0,1,2,3,4,5,6';
              defaultItem.setting.off_time = '0 0 * * 0,1,2,3,4,5,6';
              this.setState({ isShow: false });
              navigation.navigate('LHTimeEditPage', {
                timeItem: defaultItem,
                isCreate: true,
                update: () => {
                  this.requestListData();
                }
              });
            }
          }
        ]}
        buttons={[
          {
            text: LHCommonLocalizableString.common_cancel,
            style: { color: '#666666', fontSize: LHUiUtils.GetPx(14) },
            callback: () => { this.setState({ isShow: false }); }
          }
        ]}
        onDismiss={() => {
          this.setState({
            isShow: false
          });
        }}
      />
    );

    return (
      <View style={LHCommonStyle.pageGrayStyle}>
        <LHStandardListSwipeout
          data={this.getData()}
          ListFooterComponent={
            <View style={{ height: this.getData().length !== 0 ? LHUiUtils.GetPx(108) + LHDeviceUtils.AppHomeIndicatorHeight : 0 }} />
          }
          ListEmptyComponent={(
            <LHStandardEmpty
              emptyIconStyle={{ width: LHUiUtils.GetPx(138), height: LHUiUtils.GetPx(138), marginTop: LHUiUtils.GetPx(146) }}
              emptyPageStyle={{ backgroundColor: LHUiUtils.MiJiaBackgroundGray }}
              emptyTextStyle={{ marginTop: LHUiUtils.GetPx(-3) }}
              emptyIcon={Resource.TimeImage.placeholder_timing}
              text={LHLocalizedStrings.mi_acpartner_timer_list_empty}
            />
        )}
        />
        {actionSheetView}
        <View style={pageSytle.addButtom}>
          <TouchableWithoutFeedback
            onPress={() => {
              this.setState({
                isShow: true
              });
            }}
          >
            <Image
              style={{
                width: LHUiUtils.GetPx(66),
                height: LHUiUtils.GetPx(66)
              }}
              source={Resource.TimeImage.add_blue}
            />
          </TouchableWithoutFeedback>
        </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(LHTimeListPage);