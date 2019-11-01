import React from 'react';
import {
  DeviceEventEmitter, ImageBackground, StyleSheet, View
} from 'react-native';
import {
  LHUiUtils, LHDialogUtils, LHMiServer
} from 'LHCommonFunction';
import { LHText } from 'LHCommonUI';
import Resources from 'Resources';
import Device from 'miot/Device';
import Service from 'miot/Service';
import LHBaseArtificialMatchingPage from './LHBaseArtificialMatchingPage';
import LHLocalizedString from '../../Localized/LHLocalizableString';
import LHAcCloudHost from '../../Host/LHAcCloudHost';
import LHPageUtils from '../../Utils/LHPageUtils';

const styles = StyleSheet.create({
  topTipsStyle: {
    marginTop: LHUiUtils.GetPx(24),
    marginLeft: LHUiUtils.GetPx(24),
    marginRight: LHUiUtils.GetPx(24),
    fontSize: LHUiUtils.GetPx(15),
    alignSelf: 'center',
    color: '#333333'
  },
  imageBackgroundStyle: {
    height: LHUiUtils.GetPx(280),
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10),
    marginTop: LHUiUtils.GetPx(10),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const STEP_ON = 'on';
const STEP_TEMP = 'temp+';
const STEP_OFF = 'off';

export default class LHSubmitInfraredCodePage extends LHBaseArtificialMatchingPage {
  constructor(props) {
    super(props);
    this.state = {
      title: LHLocalizedString.mi_acpartner_artificial_matching_submit_infrared_code,
      uploadProcess: Resources.MatchImage.uploadProcessB,
      bottomBtText: LHLocalizedString.mi_acpartner_artificial_matching_next_step,
      bottomTipsText: LHLocalizedString.mi_acpartner_artificial_matching_received_infrared_code,
      bottomTipsColor: 'rgba(95,167,254,1)',
      showBottomTips: false,
      bottomBtDisabled: true,
      submitCodeSource: Resources.MatchImage.submitCodeA,
      topTipsText: LHLocalizedString.mi_acpartner_artificial_matching_tips_open_ac
    };
    this.isBackPressed = false;
    this.isStopIrLearn = true;
    this.isStartIrLearn = false;
    this.countValue = 0;
    this.btTextDef = LHLocalizedString.mi_acpartner_artificial_matching_next_step + '({value})';
    this.keyStr = '';
    this.step = STEP_ON;
    this.irCodeMap = [];
  }

  componentWillMount() {
    super.componentWillMount();
    this.showTurnOffTipsDialog();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.stopIrLearn();
    if (this.countDownTimer) {
      clearInterval(this.countDownTimer);
    }
  }

  onBackPressed = () => {
    this.isBackPressed = true;
    const { navigation } = this.props;
    const time = navigation.getParam('ir_learn_time', 0);
    if (time) {
      DeviceEventEmitter.emit('updateTime', time);
    }
    const { routes } = navigation.dangerouslyGetParent().state;
    if (routes) {
      const routeNames = [];
      routes.forEach((route) => {
        routeNames.push(route.routeName);
      });
      console.log('routeNames ', routeNames);
      const fromDonePage = routeNames.indexOf('LHArtificialMatchingDonePage');
      const fromMatchFailed = routeNames.indexOf('LHTipsPage');
      if (fromDonePage > -1) {
        navigation.navigate('LHArtificialMatchingDonePage');
      } else if (fromMatchFailed > -1) {
        LHPageUtils.goMatchFailedPage(navigation);
      } else {
        navigation.navigate('LHSettingPage');
      }
    } else {
      navigation.goBack();
    }
  };

  showTurnOffTipsDialog = () => {
    LHDialogUtils.MessageDialogShow({
      message: LHLocalizedString.mi_acpartner_artificial_matching_tips_close_ac_start,
      confirm: LHLocalizedString.mi_acpartner_artificial_matching_start,
      confirmStyle: { color: '#666666' },
      onConfirm: () => { this.startReadIrLearnTimer(); }
    });
  };

  startReadIrLearnTimer = () => {
    this.countValue = 20;
    this.setState({
      bottomBtDisabled: true,
      showBottomTips: false,
      bottomBtText: this.getBtTextByCountValue()
    });
    // 先执行一次，然后再设置1秒执行一次
    this.readIrLearnHandler();
    this.countDownTimer = setInterval(this.readIrLearnHandler, 1000);
  };

  readIrLearnHandler = () => {
    if (this.countValue <= 0) {
      this.stopIrLearn();
      this.stopReadIrLearnTimer();
    } else {
      this.readIrLearn();
    }
    this.countValue = this.countValue - 1;
  };

  stopReadIrLearnTimer = () => {
    clearInterval(this.countDownTimer);
    let bottomBtText = LHLocalizedString.mi_acpartner_artificial_matching_next_step;
    if (this.step === STEP_OFF) {
      bottomBtText = LHLocalizedString.mi_acpartner_artificial_matching_submit;
    }
    this.setState({
      bottomBtText,
      bottomBtDisabled: false
    });
  };

  startIrLearn = () => {
    // 开启设备学习状态之前需要保证上一次的停止学习状态已经执行成功。
    // 每次开启学习状态只能有一个学习码。
    if (this.isStopIrLearn) {
      const mDate = new Date();
      this.keyStr = (mDate.getTime() / 1000).toFixed(0);
      LHMiServer.SendRPCPayload('miIO.ir_learn', { key: this.keyStr })
        .then((res) => {
          console.log('startIrLearn success ', res);
          this.isStartIrLearn = true;
        }).catch((err) => {
          console.log('startIrLearn err ', err);
          this.isStartIrLearn = false;
        });
    } else {
      this.stopIrLearn();
    }
  };

  getBtTextByCountValue = () => {
    return this.btTextDef.replace('{value}', this.countValue);
  };

  readIrLearn = () => {
    this.setState({
      bottomBtText: this.getBtTextByCountValue()
    });
    // 读取值之前保证设备已经开启学习状态，如果没有开启先开启学习状态。
    if (this.isStartIrLearn) {
      LHMiServer.SendRPCPayload('miIO.ir_read', { key: this.keyStr })
        .then((res) => {
          console.log('readIrLearn success ', res.result);
          if (res && res.result && this.keyStr === res.result.key && res.result.code) {
            this.readIrLearnSuccess(res);
          }
        }).catch((err) => {
          console.log('readIrLearn err ', err);
        });
    } else {
      this.startIrLearn();
    }
  };

  readIrLearnSuccess = (res) => {
    const irCodeObj = { keyName: this.step, code: res.result.code };
    if (!this.irCodeMap.includes(irCodeObj, 0)) {
      this.irCodeMap.push(irCodeObj);
    }
    this.setState({
      showBottomTips: true
    });
    this.stopIrLearn();
    this.stopReadIrLearnTimer();
  };

  stopIrLearn = () => {
    LHMiServer.SendRPCPayload('miIO.ir_learn_stop', { key: this.keyStr })
      .then((res) => {
        console.log('stopIrLearn success ', res);
        this.isStartIrLearn = false;
        this.isStopIrLearn = true;
      }).catch((err) => {
        console.log('stopIrLearn err ', err);
        this.isStopIrLearn = false;
      });
  };

  bottomBtClick = () => {
    if (this.step === STEP_ON) {
      this.step = STEP_TEMP;
      this.setState({
        submitCodeSource: Resources.MatchImage.submitCodeB,
        topTipsText: LHLocalizedString.mi_acpartner_artificial_matching_tips_adjust_temperature
      });
      this.startReadIrLearnTimer();
    } else if (this.step === STEP_TEMP) {
      this.btTextDef = LHLocalizedString.mi_acpartner_artificial_matching_submit + '({value})';
      this.step = STEP_OFF;
      this.setState({
        submitCodeSource: Resources.MatchImage.submitCodeC,
        topTipsText: LHLocalizedString.mi_acpartner_artificial_matching_tips_close_ac
      });
      this.startReadIrLearnTimer();
    } else if (this.irCodeMap.length > 0) {
      this.uploadCodeStart();
      const fns = [];
      this.irCodeMap.forEach((irCode) => {
        fns.push(this.uploadIrLearnCode(irCode.keyName, irCode.code));
      });
      Promise.all(fns).then((res) => {
        console.log('uploadIrLearnCode res ', res);
        this.setUserConfigsData();
      }).catch((error) => {
        console.log('uploadIrLearnCode error ', error);
        this.uploadCodeFailed();
      });
    } else {
      const { navigation } = this.props;
      const time = navigation.getParam('ir_learn_time', 0);
      this.gotoSuccessPage(time);
    }
  };

  uploadCodeStart = () => {
    LHDialogUtils.LoadingDialogShow({ title: LHLocalizedString.mi_acpartner_artificial_matching_upload });
    this.setState({
      bottomBtDisabled: true
    });
  };

  uploadCodeSuccess = (time) => {
    LHDialogUtils.LoadingDialogHide();
    setTimeout(() => {
      if (!this.isBackPressed) {
        this.gotoSuccessPage(time);
      }
    }, 400);
  };

  uploadCodeFailed = () => {
    LHDialogUtils.LoadingDialogHide();
    this.setState({
      bottomBtDisabled: false,
      bottomBtText: LHLocalizedString.mi_acpartner_artificial_matching_retry,
      bottomTipsText: LHLocalizedString.mi_acpartner_artificial_matching_ircode_submit_failed,
      bottomTipsColor: 'rgba(244,63,49,1)',
      showBottomTips: true
    });
  };

  setUserConfigsData = () => {
    LHAcCloudHost.setUserConfigsData((time) => {
      this.uploadCodeSuccess(time);
    },
    () => {
      this.uploadCodeFailed();
    });
  };

  gotoSuccessPage = (time) => {
    const { navigation } = this.props;
    navigation.replace('LHArtificialMatchingSuccessPage', { ir_learn_time: time });
  };

  uploadIrLearnCode = (keyName, code) => {
    return new Promise((resolve, reject) => {
      const data = {
        uid: Service.account.ID,
        did: Device.deviceID,
        keyName,
        code
      };
      fetch('http://app-api.aqara.cn/api/v1/ir/feedback/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
      }).then((response) => {
        if (response.ok || response.status === 200) {
          resolve(response);
        } else {
          reject(new Error('status ' + response.status));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  };

  getContentView = () => {
    const { submitCodeSource, topTipsText } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={submitCodeSource}
          style={styles.imageBackgroundStyle}
        />
        <LHText style={styles.topTipsStyle}>{topTipsText}</LHText>
      </View>
    );
  };
}