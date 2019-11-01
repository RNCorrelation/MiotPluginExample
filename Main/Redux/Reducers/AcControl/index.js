import { handleActions } from 'redux-actions';
import {
  GET_AC_STATUS,
  UPDATE_AC_STATUS,
  GET_AC_STATUS_CACHE,
  SET_STATUS_AC_MODE,
  SET_STATUS_AC_SPEED,
  SET_STATUS_SWING,
  SET_STATUS_TEMPERATURE,
  SET_STATUS_POWER
} from '../../Actions/ActionTypes/AcControlActionTypes';
import LHAcStatus from '../../../Model/LHAcStatus';
import LHRpcHost from '../../../Host/LHRpcHost';

const defaultAcStatus = new LHAcStatus();

const commonStatusHandler = (filterKey) => {
  return {
    next(state, action) {
      const filter = {};
      filter[filterKey] = action.payload[filterKey];
      const newStatus = Object.assign({}, state, filter);
      LHRpcHost.saveDeviceStatus(newStatus);
      return newStatus;
    },
    throw(state, action) {
      console.warn(action.payload);
      return state;
    }
  };
};

const returnStatus = () => {
  return {
    next(state, action) {
      const newStatus = Object.assign({}, state, action.payload);
      LHRpcHost.saveDeviceStatus(newStatus);
      return newStatus;
    },
    throw(state, action) {
      console.warn(action.payload);
      return state;
    }
  };
};

export default handleActions({
  [GET_AC_STATUS]: returnStatus(),
  [GET_AC_STATUS_CACHE]: returnStatus(),
  [UPDATE_AC_STATUS]: returnStatus(),
  [SET_STATUS_AC_MODE]: commonStatusHandler('modeState'),
  [SET_STATUS_AC_SPEED]: commonStatusHandler('windSpeed'),
  [SET_STATUS_SWING]: commonStatusHandler('swingState'),
  [SET_STATUS_TEMPERATURE]: commonStatusHandler('temperature'),
  [SET_STATUS_POWER]: commonStatusHandler('powerState')

}, defaultAcStatus);