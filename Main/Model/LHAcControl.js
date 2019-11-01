/*
 * File: LHAcControl.js
 * Project: com.lumi.acparnter
 * File Created: Thursday, 22nd August 2019 10:27:50 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

import LHRemote from './LHRemote';
import LHAcStatus from './LHAcStatus';

export type LHAcControl = {remoteModel: LHRemote, status: LHAcStatus};