import { StyleSheet } from 'react-native';
import { LHUiUtils } from 'LHCommonFunction';

const LHCommonStyles = StyleSheet.create({
  navigatorWithBorderBotoom: {
    backgroundColor: LHUiUtils.MiJiaWhite,
    borderBottomWidth: LHUiUtils.MiJiaBorderWidth,
    borderBottomColor: LHUiUtils.MiJiaLineColor
  },
  navigatorWithoutBorderBotoom: {
    backgroundColor: LHUiUtils.MiJiaPageBgColor
  },
  pageGrayStyle: {
    flex: 1,
    backgroundColor: LHUiUtils.MiJiaBackgroundGray
  },
  pageWhiteStyle: {
    flex: 1,
    backgroundColor: LHUiUtils.MiJiaWhite
  },
  deleteComponent: {
    backgroundColor: '#F43F31',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  swipeoutImage: {
    width: LHUiUtils.GetPx(25),
    height: LHUiUtils.GetPx(25)
  },
  swipeoutText: {
    fontSize: LHUiUtils.GetPx(12),
    color: '#ffffff'
  }
});
export { LHCommonStyles as default };
