import { createAction } from 'redux-actions';
import { LHElectricityDataManager } from 'LHCommonFunction';
import {
  GET_AC_DAY_ELEC,
  GET_AC_MONTH_ELEC,
  UPDATE_AC_SETTINGS
} from '../ActionTypes/AcControlActionTypes';

const GetAcDayElec = createAction(GET_AC_DAY_ELEC, () => {
  return LHElectricityDataManager.fetchTodayElectricityData()
    .then((res) => {
      return { todayElectricity: res / 1000 };
    });
});

const GetAcMonthElec = createAction(GET_AC_MONTH_ELEC, () => {
  return LHElectricityDataManager.fetchMonthElectricityData()
    .then((res) => {
      return { monthElectricity: res / 1000 };
    });
});

const UpdateSettings = createAction(UPDATE_AC_SETTINGS, (settings) => {
  return settings;
});


const UpdateSettingActions = {
  GetAcDayElec,
  GetAcMonthElec,
  UpdateSettings
};

export default UpdateSettingActions;
