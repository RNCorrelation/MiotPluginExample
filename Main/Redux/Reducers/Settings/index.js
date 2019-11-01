import { handleActions } from 'redux-actions';
import { LHMiServer } from 'LHCommonFunction';
import {
  GET_AC_DAY_ELEC,
  GET_AC_MONTH_ELEC,
  GET_AC_SETTINGS,
  UPDATE_AC_SETTINGS
} from '../../Actions/ActionTypes/AcControlActionTypes';
import LHAcPartner from '../../../Model/LHAcPartner';
import PluginConfig from '../../../PluginConfig';

const defaultAcPartner = new LHAcPartner();


const returnAcPartnerSettings = () => {
  return {
    next(state, action) {
      const newStatus = Object.assign({}, state, action.payload);
      // cache
      LHMiServer.SetHostStorage(PluginConfig.SettingsCacheKey, newStatus);
      return newStatus;
    },
    throw(state, action) {
      console.warn(action.payload);
      return state;
    }
  };
};

export default handleActions({
  [GET_AC_DAY_ELEC]: returnAcPartnerSettings(),
  [GET_AC_MONTH_ELEC]: returnAcPartnerSettings(),
  [GET_AC_SETTINGS]: returnAcPartnerSettings(),
  [UPDATE_AC_SETTINGS]: returnAcPartnerSettings()
}, defaultAcPartner);