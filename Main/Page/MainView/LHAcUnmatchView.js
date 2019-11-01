/*
 * File: LHAcUnmatchView.js
 * Project: com.lumi.acparnter
 * File Created: Monday, 2nd September 2019 8:03:06 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import React, { Component } from 'react';
import {
  View, Image, StyleSheet
} from 'react-native';
import { LHUiUtils, LHDeviceUtils } from 'LHCommonFunction';
import { LHCardBase } from 'LHCommonUI';
import Resources from '../../../Resources';
import LHLocalizableString from '../../Localized/LHLocalizableString';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  acImage: {
    width: LHUiUtils.GetPx(310),
    height: LHUiUtils.GetPx(198),
    marginTop: LHUiUtils.GetPx(60)

  },
  cardStyle: {
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10),
    marginBottom: LHUiUtils.GetPx(10) + LHDeviceUtils.AppHomeIndicatorHeight,
    height: LHUiUtils.GetPx(80),
    borderRadius: LHUiUtils.GetPx(10)
  }
});

export default class LHAcUnmatchView extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.acImage}
          source={Resources.homePageIcon.airConditionOn}
        />

        <LHCardBase
          data={[{
            title: LHLocalizableString.mi_acpartner_add,
            iconSource: Resources.homePageIcon.airMatchAdd,
            onPress: () => {
              const { onEventAction } = this.props;
              if (typeof onEventAction === 'function') {
                onEventAction();
              }
            }
          }]}
          cardStyle={StyleSheet.flatten(styles.cardStyle)}
        />
      </View>
    );
  }
}
