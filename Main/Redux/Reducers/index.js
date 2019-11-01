import { combineReducers } from 'redux';

import mainPageReducers from './mainPage';
import RemoteModelReducers from './RemoteModel';
import StatusActionsReducers from './AcControl';
import SettingActionsReducers from './Settings';

export default function getReducers() {
  return combineReducers({
    mainPageReducers,
    RemoteModelReducers,
    StatusActionsReducers,
    SettingActionsReducers
  });
}