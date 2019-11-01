import { StyleSheet } from 'react-native';
import { LHUiUtils, LHDeviceUtils } from 'LHCommonFunction';

const LHTimeListPageStyle = StyleSheet.create({
  addButtom: {
    position: 'absolute',
    width: LHUiUtils.GetPx(66),
    height: LHUiUtils.GetPx(66),
    right: LHUiUtils.GetPx(20),
    bottom: LHUiUtils.GetPx(20) + LHDeviceUtils.AppHomeIndicatorHeight
  }
});
export { LHTimeListPageStyle as default };