/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-04 10:40:30
 * @LastEditors: nicolas
 * @LastEditTime: 2019-10-16 17:56:07
 */
import React from 'react';
import { View } from 'react-native';
import {
  LHTitleBarCustom, LHStandardListSwipeout
} from 'LHCommonUI';
import { LHCommonLocalizableString, LHDialogUtils, LHUiUtils } from 'LHCommonFunction';
import { connect } from 'react-redux';
import PluginConfig from 'PluginConfig';
import { bindActionCreators } from 'redux';
import ChoiceDialog from 'miot/ui/Dialog/ChoiceDialog';
import AbstractDialog from 'miot/ui/Dialog/AbstractDialog';
import StringSpinner from 'miot/ui/StringSpinner';
import LHLocalizedStrings from '../../../Localized/LHLocalizableString';
import LHCommonStyle from '../../../Styles/LHCommonStyle';
import LHAcStatusAsset from '../../../Model/LHAcStatusAsset';
import LHAcStatusCommand from '../../../Command/LHAcStatusCommand';
import UpdateRemoteModelActions from '../../../Redux/Actions/RemoteModel';
import Resources from '../../../../Resources';


let Instance = null;
class LHTimeWorkStatePage extends React.Component {
  static navigationOptions = () => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_timer_workstatue}
            style={[LHCommonStyle.navigatorWithBorderBotoom]}
            rightButtons={[{
              type: 'deafultCompleteBtn',
              press: () => {
                Instance.save();
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
      )
    };
  }

  constructor(prop) {
    super(prop);
    Instance = this;
    const acStatus = this.getAcStatus();
    this.state = ({
      acStatus,
      isShowModeView: false,
      isShowTempView: false,
      isShowSpeedView: false,
      isShowWindDirectView: false
    });
  }

  getAcStatus() {
    const { navigation, Remote } = this.props;
    const { status } = navigation.state.params;
    const acStatus = LHAcStatusCommand.parseStatusFromCommand(status);
    if (Remote.judgeTempCanControl(acStatus.modeState)) {
      const supportedTemps = Remote.supportedTempsWithMode(acStatus.modeState);
      const MIN_TEMP = Math.min(...supportedTemps);
      const MAX_TEMP = Math.max(...supportedTemps);
      if (acStatus.temperature > MAX_TEMP) {
        acStatus.temperature = MAX_TEMP;
      }
      if (acStatus.temperature < MIN_TEMP) {
        acStatus.temperature = MIN_TEMP;
      }
    }
    return acStatus;
  }

  getData() {
    const { Remote } = this.props;
    const { acStatus } = this.state;
    const datas = [];
    if (Remote.judgeModeCanControl()) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_mode,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: LHAcStatusAsset.acModeDespWithMode(acStatus.modeState),
        press: () => {
          this.setState({
            isShowModeView: true
          });
        }
      };
      datas.push(data);
    }
    if (Remote.judgeTempCanControl(acStatus.modeState)) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_timer_temperature,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: acStatus.temperature + '℃',
        press: () => {
          this.setState({
            isShowTempView: true
          });
        }
      };
      datas.push(data);
    }
    if (Remote.judgeSpeedCanControl(acStatus.modeState)) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_fanspeed,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: LHAcStatusAsset.acSpeedDespWithSpeed(acStatus.windSpeed),
        press: () => {
          this.setState({
            isShowSpeedView: true
          });
        }
      };
      datas.push(data);
    }
    if (Remote.judgeWindDerectCanControl()) {
      const data = {
        title: LHLocalizedStrings.mi_acpartner_airswing,
        titleNumberOfLines: 1,
        hideRightArrow: false,
        rightDescription: LHAcStatusAsset.acSwingDespWithSwing(acStatus.swingState),
        press: () => {
          this.setState({
            isShowWindDirectView: true
          });
        }
      };
      datas.push(data);
    }
    return [{ data: datas }];
  }

  getModeList() {
    const { Remote } = this.props;
    const modesArr = Remote.supportedModes();
    const datas = [];
    if (!modesArr) {
      return datas;
    }
    if (modesArr) {
      modesArr.forEach((item) => {
        const data = {
          title: LHAcStatusAsset.acModeDespWithMode(item)
        };
        datas.push(data);
      });
    }
    return datas;
  }

  getSpeedList(mode) {
    const { Remote } = this.props;
    let speedArr = Remote.supportedSpeedsWithMode(mode);
    const datas = [];
    if (!speedArr) {
      return datas;
    }
    if (speedArr) {
      speedArr = this.getTagetSpeedArr(speedArr);
      speedArr.forEach((item) => {
        const data = {
          title: LHAcStatusAsset.acSpeedDespWithSpeed(item)
        };
        datas.push(data);
      });
    }
    return datas;
  }

  getTagetSpeedArr(speedArr) {
    const { Remote } = this.props;
    const tagetArr = [];
    if (speedArr.indexOf(0) !== -1) {
      tagetArr.push(0);
    }
    for (let i = 3; i > 0; i -= 1) {
      if (speedArr.indexOf(i) !== -1) {
        tagetArr.push(i);
      }
    }
    return tagetArr;
  }

  getWindDirectList() {
    const { Remote } = this.props;
    const datas = [{ title: LHCommonLocalizableString.common_on }, { title: LHCommonLocalizableString.common_off }];
    return datas;
  }

  save() {
    const { Remote } = this.props;
    const { navigation } = this.props;
    const { acStatus } = this.state;
    const { back } = navigation.state.params;
    back(LHAcStatusCommand.powerCommandFromStatus(acStatus, Remote));
    navigation.goBack();
  }

  back() {
    const { Remote } = this.props;
    const { navigation } = this.props;
    const { status } = navigation.state.params;
    const { acStatus } = this.state;
    const localstatus = LHAcStatusCommand.powerCommandFromStatus(acStatus, Remote);
    if (localstatus === status) {
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

  render() {
    const { Remote } = this.props;
    const { acStatus } = this.state;
    const {
      isShowModeView, isShowTempView, isShowSpeedView, isShowWindDirectView
    } = this.state;
    this.temp = acStatus.temperature;
    const modeSupportArr = Remote ? (Remote.supportedModes() ? Remote.supportedModes() : []) : [];
    const tempSupportArr = Remote ? (Remote.sortedsupportedTempsWithMode(acStatus.modeState, Remote) ? Remote.sortedsupportedTempsWithMode(acStatus.modeState, Remote) : []) : [];
    let speedSupportArr = Remote ? (Remote.supportedSpeedsWithMode(acStatus.modeState) ? Remote.supportedSpeedsWithMode(acStatus.modeState) : []) : [];
    const modeSelecedIndex = modeSupportArr.indexOf(acStatus.modeState);
    if (modeSelecedIndex === -1) {
      if (modeSupportArr.length !== 0) {
        acStatus.modeState = modeSupportArr[0];
        this.setState({
          acStatus
        });
      }
    }
    const tempSelecedIndex = tempSupportArr.indexOf(acStatus.temperature);
    if (tempSelecedIndex === -1) {
      if (tempSupportArr.length !== 0) {
        acStatus.temperature = tempSupportArr[0];
        this.setState({
          acStatus
        });
      }
    }
    speedSupportArr = this.getTagetSpeedArr(speedSupportArr);
    const speedSelecedIndex = speedSupportArr.indexOf(acStatus.windSpeed);
    if (speedSelecedIndex === -1) {
      if (speedSupportArr.length !== 0) {
        acStatus.windSpeed = speedSupportArr[0];
        this.setState({
          acStatus
        });
      }
    }
    console.log('modeindex:' + modeSelecedIndex);
    console.log('speedindex:' + speedSelecedIndex);
    const actionSheetModeView = (
      <ChoiceDialog
        title={LHLocalizedStrings.mi_acpartner_mode}
        type={ChoiceDialog.TYPE.SINGLE}
        visible={isShowModeView}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        options={this.getModeList()}
        onSelect={(item) => {
          acStatus.modeState = modeSupportArr.length >= item[0] ? modeSupportArr[item[0]] : 0;
          this.setState({
            acStatus
          });
        }}
        selectedIndexArray={[modeSelecedIndex]}
        onDismiss={() => {
          this.setState({
            isShowModeView: false
          });
        }}
      />
    );
    const actionSheetTempView = (
      <AbstractDialog
        title={LHLocalizedStrings.mi_acpartner_timer_temperature}
        visible={isShowTempView}
        onDismiss={() => {
          this.setState({
            isShowTempView: false
          });
        }}
        buttons={[{
          text: LHCommonLocalizableString.common_ok,
          callback: () => {
            if (this.temp !== acStatus.temperature) {
              acStatus.temperature = this.temp;
            }
            this.setState({
              acStatus,
              isShowTempView: false
            });
          }
        }]}
      >
        <View>
          <View style={{ height: LHUiUtils.GetPx(1), color: 'black' }} />
          <StringSpinner
            style={{ marginHorizontal: 0, height: 200 }}
            pickerInnerStyle={{
              selectTextColor: '#333333',
              unitTextColor: '#333333',
              selectBgColor: '#F3F3F3'
            }}
            unit="℃"
            dataSource={tempSupportArr.map((item) => {
              return item + '';
            })}
            defaultValue={acStatus.temperature + ''}
            onValueChanged={(data) => {
              this.temp = Number(data.newValue);
            }}
          />
          <View style={{ height: LHUiUtils.GetPx(1), color: 'black' }} />
        </View>
      </AbstractDialog>
    );
    const actionSheetSpeedView = (
      <ChoiceDialog
        title={LHLocalizedStrings.mi_acpartner_fanspeed}
        visible={isShowSpeedView}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        options={this.getSpeedList(acStatus.modeState)}
        selectedIndexArray={[speedSelecedIndex]}
        onSelect={(res) => {
          acStatus.windSpeed = speedSupportArr.length >= res[0] ? speedSupportArr[res[0]] : 0;
          this.setState({
            acStatus
          });
        }}
        onDismiss={() => {
          this.setState({
            isShowSpeedView: false
          });
        }}
      />
    );

    const actionSheetWindDirectView = (
      <ChoiceDialog
        title={LHLocalizedStrings.mi_acpartner_airswing}
        visible={isShowWindDirectView}
        options={this.getWindDirectList()}
        selectedIndexArray={[acStatus.swingState]}
        color={PluginConfig.MainColor}
        icon={Resources.TimeImage.selectIcon}
        onSelect={(res) => {
          acStatus.swingState = res[0];
          this.setState({
            acStatus
          });
        }}
        onDismiss={() => {
          this.setState({
            isShowWindDirectView: false
          });
        }}
      />
    );

    return (
      <View style={LHCommonStyle.pageGrayStyle}>
        <LHStandardListSwipeout
          data={this.getData()}
        />
        {actionSheetModeView}
        {actionSheetTempView}
        {actionSheetSpeedView}
        {actionSheetWindDirectView}
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

export default connect(mapStateToProps, mapDispatchToProps)(LHTimeWorkStatePage);