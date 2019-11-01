/*
 * File: LHIRHost.js
 * Project: com.lumi.acparnter
 * File Created: Monday, 23rd September 2019 3:49:38 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */
import { Device } from 'miot';
import LHIRRpcHost from './LHIRRpcHost';
import LHIRCloudHost from './LHIRCloudHost';
import PluginConfig from '../../PluginConfig';

const getHost = () => {
  // 判断固件版本号，如果是支持的话，用RPC去控制红外发码
  return PluginConfig.IsSupportRpcIRControl(Device.lastVersion) ? LHIRRpcHost : LHIRCloudHost;
};

const LHIRHost = getHost();

export default LHIRHost;
