import { createAction } from 'redux-actions';
import {
  GET_AC_STATUS,
  UPDATE_AC_STATUS,
  GET_AC_STATUS_CACHE,
  SET_STATUS_AC_MODE,
  SET_STATUS_AC_SPEED,
  SET_STATUS_SWING,
  SET_STATUS_TEMPERATURE,
  SET_STATUS_POWER
} from '../ActionTypes/AcControlActionTypes';
import LHAcCommandSender from '../../../Command/LHAcCommandSender';
import LHRpcHost from '../../../Host/LHRpcHost';

// 获取状态
const GetAcDeviceStatus = createAction(GET_AC_STATUS, () => {
  return LHRpcHost.getDeviceData()
    .then((res) => {
      return res.status;
    });
});
// 获取状态
const UpdateAcDeviceStatus = createAction(UPDATE_AC_STATUS, (status) => {
  return status;
});

const RestoreAcDeviceStatus = createAction(GET_AC_STATUS_CACHE, () => {
  return LHRpcHost.restoreDeviceStatus();
});


// 模式
const SetStatusAcMode = createAction(SET_STATUS_AC_MODE, (mode, control) => {
  return LHAcCommandSender.setAcMode(mode, control);
});

// 风速
const SetStatusAcWindSpeed = createAction(SET_STATUS_AC_SPEED, (wind, control) => {
  return LHAcCommandSender.setACWindSpeed(wind, control);
});

// 扫风
const SetStatusAcSwing = createAction(SET_STATUS_SWING, (value, control) => {
  return LHAcCommandSender.setACSwing(value, control);
});

// 温度
const SetStatusAcTemperature = createAction(SET_STATUS_TEMPERATURE, (value, control) => {
  return LHAcCommandSender.setACTemperature(value, control);
});

// 开关
const SetStatusAcPower = createAction(SET_STATUS_POWER, (value, control) => {
  return LHAcCommandSender.setACPower(value, control);
});

const UpdateStatusActions = {
  GetAcDeviceStatus,
  SetStatusAcMode,
  SetStatusAcWindSpeed,
  SetStatusAcTemperature,
  SetStatusAcPower,
  SetStatusAcSwing,
  RestoreAcDeviceStatus,
  UpdateAcDeviceStatus
};

export default UpdateStatusActions;