import React from 'react';
import { Image, View, BackHandler } from 'react-native';
import { LHDeviceUtils, LHUiUtils } from 'LHCommonFunction';
import {
  LHButton, LHCommonStyles, LHSeparator, LHText, LHTitleBarCustom
} from 'LHCommonUI';

export default class LHBaseArtificialMatchingPage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('title', '');
    const uploadProcessImg = navigation.getParam('uploadProcess', undefined);
    const onBackPressed = navigation.getParam('onBackPressed', () => {});
    const gesturesEnabled = navigation.getParam('gesturesEnabled', true);
    let borderBottomColor;
    if (uploadProcessImg) {
      borderBottomColor = LHUiUtils.MiJiaWhite;
    } else {
      borderBottomColor = LHUiUtils.MiJiaLineColor;
    }
    return {
      gesturesEnabled,
      header: (
        <View>
          <LHTitleBarCustom
            title={title}
            style={{
              backgroundColor: LHUiUtils.MiJiaWhite,
              borderBottomColor
            }}
            onPressLeft={() => {
              if (onBackPressed) {
                onBackPressed();
              }
            }}
          />
          {uploadProcessImg ? (
            <View style={{
              backgroundColor: LHUiUtils.MiJiaWhite,
              height: LHUiUtils.GetPx(62),
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: LHUiUtils.GetPx(220),
                  height: LHUiUtils.GetPx(20),
                  marginBottom: LHUiUtils.GetPx(18)
                }}
                source={uploadProcessImg}
              />
            </View>
          ) : null}
        </View>
      )
    };
  };

  componentWillMount() {
    const { navigation } = this.props;
    const {
      title,
      uploadProcess,
      gesturesEnabled,
      showProcess
    } = this.state;
    navigation.setParams({
      title, uploadProcess, gesturesEnabled, showProcess, onBackPressed: this.onBackPressed
    });
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backHandler);
  }

  componentWillUnmount() {
    if (this.backHandler) {
      BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
    }
  }

  backHandler = () => {
    this.onBackPressed();
    return true;
  };

  onBackPressed = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  bottomBtClick = () => {};

  getContentView = () => {};

  isShowBottomTipsDot = () => {
    return true;
  };

  render() {
    const {
      bottomBtText,
      bottomTipsText,
      bottomTipsColor,
      bottomBtDisabled,
      showBottomTips
    } = this.state;
    const contentView = this.getContentView();
    const bottomTipsDot = this.isShowBottomTipsDot() ? (
      <View style={{
        marginEnd: LHUiUtils.GetPx(8),
        borderRadius: LHUiUtils.GetPx(6),
        width: LHUiUtils.GetPx(6),
        height: LHUiUtils.GetPx(6),
        backgroundColor: bottomTipsColor
      }}
      />
    ) : null;
    const bottomTips = showBottomTips ? (
      <View style={{
        flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end'
      }}
      >
        <View style={{
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: LHUiUtils.GetPx(21)
        }}
        >
          {bottomTipsDot}
          <LHText style={{ fontSize: LHUiUtils.GetPx(13), color: bottomTipsColor }}>{bottomTipsText}</LHText>
        </View>
      </View>
    ) : null;
    return (
      <View style={LHCommonStyles.pageGrayStyle}>
        <LHSeparator />
        {contentView}
        <View style={{ justifyContent: 'flex-end', height: LHUiUtils.GetPx(108) + LHDeviceUtils.AppHomeIndicatorHeight }}>
          {bottomTips}
          <LHButton
            btnText={bottomBtText}
            style={{ marginBottom: LHUiUtils.GetPx(24) + LHDeviceUtils.AppHomeIndicatorHeight, marginLeft: LHUiUtils.GetPx(24), marginRight: LHUiUtils.GetPx(24) }}
            disabled={!!bottomBtDisabled}
            onPress={() => { this.bottomBtClick(); }}
          />
        </View>
      </View>
    );
  }
}