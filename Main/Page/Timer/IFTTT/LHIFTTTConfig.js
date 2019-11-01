import { CommonMethod, LHDeviceModel } from 'LHCommonFunction';

export default class LHIFTTTConfig {
  /**
  * 懒人闹钟 定时 identify
  * @type {string}
  */
  static LazyClockTimerIdentify = 'lumi_gateway_clock_timer';

  /**
  * 感应夜灯 identify
  * @type {string}
  */
  static NightLightIdentify = 'lm_scene_toggle_smart_light';

  /**
  * 联动报警
  */
  static LinkageAlarmIdentify = 'lm_linkage_alarm';

  static LinkageDisAlarmIdentify = 'lm_linkage_dis_alarm';

  static LinkageDisAllAlarmIdentify = 'lm_linkage_dis_all_alarm';

  /**
   * 系统场景
   * @type {number}
   */
  static SysIFTTTTypeIFThen = 22;

  /**
   * 联动报警支持列表
   * @type {*[]}
   */
  static LinkageAlarmGatewayList = [
    LHDeviceModel.DeviceModelAqaraHubAqHM01(),
    LHDeviceModel.DeviceModelAqaraHubAqHM02(),
    LHDeviceModel.DeviceModelAqaraHubLmUK01(),
    LHDeviceModel.DeviceModelAqaraHubMiEU01(),
    LHDeviceModel.DeviceModelAqaraHubMiHK01(),
    LHDeviceModel.DeviceModelAqaraHubMiTW01(),
    LHDeviceModel.DeviceModelGatewayV1(),
    LHDeviceModel.DeviceModelGatewayV2(),
    LHDeviceModel.DeviceModelGatewayV3(),
    LHDeviceModel.DeviceAcpartnerV1(),
    LHDeviceModel.DeviceAcpartnerV2(),
    LHDeviceModel.DeviceAcpartnerV3(),
    LHDeviceModel.DeviceCameraAq1(),
    LHDeviceModel.DeviceCameraGwAq1()
  ];

  /**
   * 感应夜灯支持人体model
   */
  static NightLightMotionDevice = [
    LHDeviceModel.DeviceModelSensorMotionV2(),
    LHDeviceModel.DeviceModelSensorMotionAq2()
  ];

  /**
   * 缓存key:懒人闹钟
   */
  static LazyLockCacheKey = CommonMethod.CreatCacheKey('lazyLockTimeList');

  /**
   * 缓存key:联动报警
   */
  static LinkageAlarmCacheKey = CommonMethod.CreatCacheKey('LinkageAlarmCacheKey');

  static LinkageAlarmIDCacheKey = CommonMethod.CreatCacheKey('LinkageAlarmIDCacheKey');
}