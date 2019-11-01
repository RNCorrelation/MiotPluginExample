import React from 'react';
import {
  DeviceEventEmitter, Dimensions, ImageBackground, StyleSheet, View
} from 'react-native';
import { LHDateUtils, LHUiUtils, LHDeviceUtils } from 'LHCommonFunction';
import { LHText } from 'LHCommonUI';
import Resources from 'Resources';
import LHBaseArtificialMatchingPage from './LHBaseArtificialMatchingPage';
import LHLocalizedString from '../../Localized/LHLocalizableString';
import LHAcCloudHost from '../../Host/LHAcCloudHost';

const styles = StyleSheet.create({
  centerBigTipsStyle: {
    fontSize: LHUiUtils.GetPx(15),
    marginLeft: LHUiUtils.GetPx(20),
    marginRight: LHUiUtils.GetPx(20),
    marginTop: LHUiUtils.GetPx(-5),
    alignSelf: 'center',
    textAlign: 'center',
    color: '#999999'
  },
  centerSmallTipsStyle: {
    marginTop: LHUiUtils.GetPx(10),
    marginLeft: LHUiUtils.GetPx(20),
    marginRight: LHUiUtils.GetPx(20),
    fontSize: LHUiUtils.GetPx(13),
    alignSelf: 'center',
    textAlign: 'center',
    color: '#999999'
  },
  imageBackgroundStyle: {
    height: LHUiUtils.GetPx(138),
    width: LHUiUtils.GetPx(138),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const { height } = Dimensions.get('window');
export default class LHArtificialMatchingDonePage extends LHBaseArtificialMatchingPage {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const time = navigation.getParam('ir_learn_time', 0);
    const bottomTipsText = LHDateUtils.DateFormat('yyyy.MM.dd hh:mm:ss', time);
    this.state = {
      title: LHLocalizedString.mi_acpartner_setting_pairing_customer,
      bottomBtText: LHLocalizedString.mi_acpartner_artificial_matching_re_upload,
      bottomTipsText,
      bottomTipsColor: '#999999',
      showBottomTips: true,
      screenHeight: height
    };
  }

  componentDidMount() {
    super.componentDidMount();
    LHDeviceUtils.GetPhoneScreenHeight((value) => {
      this.setState({ screenHeight: value });
    });
    this.updateTimeListener = DeviceEventEmitter.addListener('updateTime', (time) => {
      this.updateBottomTipsText(time);
    });
    LHAcCloudHost.loadUserConfigsData((res) => {
      if (res && res.ir_learn_time > 0) {
        this.updateBottomTipsText(res.ir_learn_time);
      }
    }, (err) => {
      console.log('loadUserConfigsData ', err);
    });
  }

  updateBottomTipsText = (time) => {
    const bottomTipsText = LHDateUtils.DateFormat('yyyy.MM.dd hh:mm:ss', time);
    this.setState({
      bottomTipsText
    });
  };

  componentWillUnmount() {
    super.componentWillUnmount();
    this.updateTimeListener.remove();
  }

  bottomBtClick = () => {
    const { navigation } = this.props;
    navigation.navigate('LHUploadRemoteControlPage');
  };

  isShowBottomTipsDot = () => {
    return false;
  };

  getContentView = () => {
    const { uploadProcess, screenHeight } = this.state;
    let imgMarginTop;
    if (uploadProcess) {
      imgMarginTop = 84;
    } else {
      imgMarginTop = 146;
    }
    let marginTop = imgMarginTop * screenHeight / 780;
    const gap = marginTop - LHUiUtils.GetPx(imgMarginTop);
    marginTop += (gap > 0 ? gap : 2 * gap) / 3;
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <ImageBackground
          source={Resources.MatchImage.submitCodeSuccess}
          style={[styles.imageBackgroundStyle, { marginTop }]}
        />
        <LHText style={styles.centerBigTipsStyle}>
          {LHLocalizedString.mi_acpartner_artificial_matching_upload_remote_control_sc}
        </LHText>
        <LHText style={styles.centerSmallTipsStyle}>
          {LHLocalizedString.mi_acpartner_artificial_matching_tips_contact_customer_sv}
        </LHText>
      </View>
    );
  };
}