/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-04 10:40:30
 * @LastEditors: nicolas
 * @LastEditTime: 2019-10-15 11:37:31
 */
import LHAcStatusAsset from '../Model/LHAcStatusAsset';

import LHAcStatusCommand from '../Command/LHAcStatusCommand';

function getStatue(command, remote, needLine = true) {
  if (!remote || !command) {
    return {};
  }
  let description = '';

  let mode = null;

  let temp = null;

  let speed = null;

  let windDirect = null;

  command.split('_').forEach((item) => {
    if (item.indexOf('M') !== -1) {
      mode = Number(item.substring(1, item.length));
      description += (needLine ? ' | ' : ' ') + LHAcStatusAsset.acModeDespWithMode(mode);
    }
    if (item.indexOf('T') !== -1) {
      if (mode === null) {
        return;
      }
      temp = Number(item.substring(1, item.length));
      description += (needLine ? ' | ' : ' ') + temp + '℃';
    }
    if (item.indexOf('S') !== -1) {
      speed = Number(item.substring(1, item.length));
      description += (needLine ? ' | ' : ' ') + LHAcStatusAsset.acSpeedLongDespWithSpeed(speed);
    }
    if (item.indexOf('D') !== -1) {
      windDirect = Number(item.substring(1, item.length)) > 0 ? 1 : 0;
      description += (needLine ? ' | ' : ' ') + LHAcStatusAsset.acSwingLongDespWithSwing(windDirect);
    }
  });

  if (description.indexOf(needLine ? ' | ' : ' ') === 0) {
    description = description.substring(needLine ? 3 : 1, description.length);
  }
  return {
    description
  };
}
function getRightModeFromSupportArr(Remote, acStatus) {
  const modeSupportArr = Remote ? (Remote.supportedModes() ? Remote.supportedModes() : []) : [];
  const modeSelecedIndex = modeSupportArr.indexOf(acStatus.modeState);
  if (modeSelecedIndex === -1) {
    if (modeSupportArr.length !== 0) {
      acStatus.modeState = modeSupportArr[0];
    }
  }
  return acStatus;
}

function getRightTempFromSupportArr(Remote, acStatus) {
  const tempSupportArr = Remote ? (Remote.sortedsupportedTempsWithMode(acStatus.modeState, Remote) ? Remote.sortedsupportedTempsWithMode(acStatus.modeState, Remote) : []) : [];

  const tempSelecedIndex = tempSupportArr.indexOf(acStatus.temperature);
  if (tempSelecedIndex === -1) {
    if (tempSupportArr.length !== 0) {
      acStatus.temperature = speedSupportArr[0];
    }
  }
  return acStatus;
}

function getRightSpeedFromSupportArr(Remote, acStatus) {
  const speedSupportArr = Remote ? (Remote.supportedSpeedsWithMode(acStatus.modeState) ? Remote.supportedSpeedsWithMode(acStatus.modeState) : []) : [];
  const speedSelecedIndex = speedSupportArr.indexOf(acStatus.windSpeed);
  if (speedSelecedIndex === -1) {
    if (speedSupportArr.length !== 0) {
      acStatus.windSpeed = speedSupportArr[0];
      this.setState({
        acStatus
      });
    }
  }
  return acStatus;
}

function checkSameRemote(items, remote) {
  if (!items || !remote) {
    return false;
  }
  for (let i = 0; i < items.length; i += 1) {
    const acStatus = LHAcStatusCommand.parseStatusFromCommand(items[i].setting.on_param);
    if (items[i].setting.on_param.indexOf('T') !== -1) {
      if (!remote.judgeTempCanControl(acStatus.modeState)) {
        return false;
      }
    } else if (remote.judgeTempCanControl(acStatus.modeState)) {
      return false;
    }
    if (items[i].setting.on_param.indexOf('S') !== -1) {
      if (!remote.judgeSpeedCanControl(acStatus.modeState)) {
        return false;
      }
    } else if (remote.judgeSpeedCanControl(acStatus.modeState)) {
      return false;
    }
    if (items[i].setting.on_param.indexOf('D') !== -1) {
      if (!remote.judgeWindDerectCanControl()) {
        return false;
      }
    } else if (remote.judgeWindDerectCanControl()) {
      return false;
    }
  }
  return true;
}

function checkTemprateOutOfSupport(items, remote) {
  if (!items || !remote) {
    return true;
  }
  for (let i = 0; i < items.length; i += 1) {
    const acStatus = LHAcStatusCommand.parseStatusFromCommand(items[i].setting.on_param);
    if (items[i].setting.on_param.indexOf('T') !== -1) {
      if (!remote.judgeTempCanControl(acStatus.modeState)) {
        return true;
      } else {
        const supportedTemps = remote.supportedTempsWithMode(acStatus.modeState);
        if (supportedTemps.indexOf(acStatus.temperature) === -1) {
          return true;
        }
      }
    }
  }
  return false;
}

function getInitAcStatus(remote) {
  let command = 'P0_M0_T26';
  if (remote.judgeSpeedCanControl(0)) {
    console.log(remote.supportedSpeedsWithMode(0));
    command = command + '_S' + remote.supportedSpeedsWithMode(0)[0];
  }
  if (remote.judgeWindDerectCanControl()) {
    command += '_D0';
  }
  return command;
}

export default {
  getStatue,
  getRightModeFromSupportArr,
  getRightTempFromSupportArr,
  getRightSpeedFromSupportArr,
  checkSameRemote,
  checkTemprateOutOfSupport,
  getInitAcStatus
};