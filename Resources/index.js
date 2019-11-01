/*
 * @Date: 2019-08-10 16:48:53
 * @LastEditors: Lavie
 * @LastEditTime: 2019-08-12 10:17:44
 */

import { PolicyLicenseUrl } from './policyLicenseUrl';

export default class Resources {
  static PolicyLicense = PolicyLicenseUrl;

  static homePageIcon = {
    speedHigh: require('./HomePage/ac_homepage_wind_speed_high.png'),
    speedMedium: require('./HomePage/ac_homepage_wind_speed_medium.png'),
    speedLow: require('./HomePage/ac_homepage_wind_speed_low.png'),
    speedAuto: require('./HomePage/ac_homepage_mode_auto.png'),
    speedHighPress: require('./HomePage/ac_homepage_wind_speed_high_press.png'),
    speedMediumPress: require('./HomePage/ac_homepage_wind_speed_medium_press.png'),
    speedLowPress: require('./HomePage/ac_homepage_wind_speed_low_press.png'),
    speedAutoPress: require('./HomePage/ac_homepage_mode_auto_press.png'),

    modeCool: require('./HomePage/ac_homepage_mode_cool.png'),
    modeHeat: require('./HomePage/ac_homepage_mode_heating.png'),
    modeAuto: require('./HomePage/ac_homepage_mode_auto.png'),
    modeDry: require('./HomePage/ac_homepage_mode_dehumidification.png'),
    modeWind: require('./HomePage/ac_homepage_mode_put_wind.png'),
    modeCoolPress: require('./HomePage/ac_homepage_mode_cool_press.png'),
    modeHeatPress: require('./HomePage/ac_homepage_mode_heating_press.png'),
    modeAutoPress: require('./HomePage/ac_homepage_mode_auto_press.png'),
    modeDryPress: require('./HomePage/ac_homepage_mode_dehumidification_press.png'),
    modeWindPress: require('./HomePage/ac_homepage_mode_put_wind_press.png'),

    swing: require('./HomePage/ac_homepage_sweep_wind.png'),
    swingDirection: require('./HomePage/ac_homepage_wind_direction_1.png'),

    powerOn: require('./HomePage/ac_homepage_on.png'),
    powerOff: require('./HomePage/ac_homepage_off.png'),

    quickCool: require('./HomePage/ac_homepage_quick_cool.png'),
    sleepMode: require('./HomePage/ac_homepage_sleep.png'),
    timer: require('./HomePage/ac_homepage_timing.png'),
    delayOff: require('./HomePage/ac_homepage_delay_time.png'),

    airConditionOn: require('./MatchPage/lumi_air_conditioning_on.png'),
    airMatchAdd: require('./HomePage/ac_homepage_add.png'),

    defaultKey: require('./HomePage/ac_homepage_default.png'),

    tempPlug: require('./HomePage/ac_adjust_temp_plus.png'),
    tempMinus: require('./HomePage/ac_adjust_temp_minus.png'),

    nonStatusHeader: require('./HomePage/lumi_air_conditioning_blue_shadow.png')
  }

  static quickCoolPage = {
    coolCurve: require('./SettingPage/quick_cool_curve.png')
  }

  static MatchImage = {
    brandSearchEmptyIcon: require('./MatchPage/search_no.png'),
    matchIcon: require('./MatchPage/lumi_ac_homepage_switch_blue.png'),
    arrowLeftIcon: require('./MatchPage/ac_match_left_arrow.png'),
    arrowRightIcon: require('./MatchPage/ac_match_right_arrow.png'),
    lumiAcMatchPic: require('./MatchPage/lumi_ac_match_pic.png'),
    failIcon: require('./MatchPage/fail_icon.png'),
    successIcon: require('./MatchPage/success_icon.png'),
    uploadProcessA: require('./MatchPage/ac_match_fail_upload_process_a.png'),
    uploadProcessB: require('./MatchPage/ac_match_fail_upload_process_b.png'),
    uploadProcessC: require('./MatchPage/ac_match_fail_upload_process_c.png'),
    uploadCamera: require('./MatchPage/upload_camera.png'),
    uploadPhotoCard: require('./MatchPage/ac_match_fail_upload_photo_card.png'),
    submitCodeA: require('./MatchPage/ac_match_fail_submit_code_b.png'),
    submitCodeB: require('./MatchPage/ac_match_fail_submit_code_a.png'),
    submitCodeC: require('./MatchPage/ac_match_fail_submit_code_b.png'),
    submitCodeSuccess: require('./MatchPage/ac_match_fail_submit_success.png')
  };

  static SettingImage = {
    acWorkModeNormalSelect: require('./SettingPage/ac_work_mode_normal_selected.png'),
    acWorkModeNormalUnSelect: require('./SettingPage/ac_work_mode_normal_unselected.png'),
    acWorkModeNoPlugSelect: require('./SettingPage/ac_work_mode_no_selected.png'),
    acWorkModeNoPlugUnSelect: require('./SettingPage/ac_work_mode_no_unselected.png'),
    acDottedLine: require('./SettingPage/ac_dotted_line.png')
  }

  static TimeImage = {
    placeholder_timing: require('./TimePage/placeholder_timing.png'),
    add_blue: require('./TimePage/add_blue.png'),
    selectIcon: require('./TimePage/select_icon.png')
  }
}
