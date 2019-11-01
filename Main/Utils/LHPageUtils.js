/*
 * File Created: 2019-09-23 11:54
 * Author: 凌志文 (zhiwen.ling@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import Resources from 'Resources';
import { LHUiUtils } from 'LHCommonFunction';
import PluginConfig from 'PluginConfig';
import LHLocalizedStrings from '../Localized/LHLocalizableString';
import LHAcCloudHost from '../Host/LHAcCloudHost';

export default class LHPageUtils {
  static goMatchFailedPage(navigation) {
    navigation.navigate('LHTipsPage', {
      gesturesEnabled: false,
      pageTitle: LHLocalizedStrings.mi_acpartner_match_failed,
      imgSource: Resources.MatchImage.failIcon,
      title: LHLocalizedStrings.mi_acpartner_failed_hint,
      backFunction: () => {
        navigation.navigate('LHMainPage');
      },
      button: {
        buttonType: 0,
        btnText: LHLocalizedStrings.mi_acpartner_setting_pairing_customer,
        btnTextStyle: {
          color: PluginConfig.btnTextColor
        },
        style: {
          backgroundColor: LHUiUtils.MiJiaWhite,
          borderWidth: LHUiUtils.MiJiaBorderWidth,
          borderColor: LHUiUtils.MiJiaLineColor
        },
        onPress: (instance) => {
          instance.removeBackHandler();
          LHAcCloudHost.loadUserConfigsDataAndGoPage(navigation, false, false);
        }
      }
    });
  }

  static goMatchSuccessPage(navigation) {
    navigation.navigate('LHTipsPage', {
      gesturesEnabled: false,
      pageTitle: LHLocalizedStrings.mi_acpartner_match_success,
      imgSource: Resources.MatchImage.successIcon,
      title: LHLocalizedStrings.mi_acpartner_match_success_hint,
      backFunction: () => {
        navigation.navigate('LHMainPage');
      },
      button: {
        buttonType: 1,
        btnText: LHLocalizedStrings.mi_acpartner_match_finish,
        pressBackgroundColor: PluginConfig.MainColor,
        btnTextStyle: {
          color: LHUiUtils.MiJiaWhite
        },
        style: {
          backgroundColor: PluginConfig.MainColor,
          borderWidth: LHUiUtils.MiJiaBorderWidth,
          borderColor: LHUiUtils.MiJiaLineColor
        },
        onPress: () => {
          navigation.navigate('LHMainPage');
        }
      }
    });
  }
}
