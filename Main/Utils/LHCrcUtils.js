/*
 * File: LHCrcUtils.js
 * Project: com.lumi.acparnter
 * File Created: Wednesday, 25th September 2019 9:42:17 pm
 * Author: 刘观洋 (guanyang.liu@aqara.com)
 * link: https://github.com/lumigit
 * copyright: Lumi United Technology Co., Ltd.
 */

export default class LHCrcUtils {
  static makeCRCTable() {
    let c;
    const crcTable = [];
    for (let n = 0; n < 256; n += 1) {
      c = n;
      for (let k = 0; k < 8; k += 1) {
      // eslint-disable-next-line no-bitwise
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      crcTable[n] = c;
    }
    return crcTable;
  }

  static crc32(str) {
    const crcTable = window.crcTable || (window.crcTable = this.makeCRCTable());
    // eslint-disable-next-line no-bitwise
    let crc = 0 ^ (-1);

    for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    // eslint-disable-next-line no-bitwise
    return (crc ^ (-1)) >>> 0;
  }

  // 计算空调码库范围的crc32
  static getRemoteCrc32(controllerId, remote) {
    return this.crc32(controllerId + JSON.stringify(remote));
  }
}
