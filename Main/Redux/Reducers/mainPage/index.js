import { handleActions } from 'redux-actions';
import {
  CHANGE_TEXT_TEST,
  SHOW_MORE_DIALOG
} from '../../Actions/ActionTypes';

export default handleActions({
  [CHANGE_TEXT_TEST]: {
    next(state, action) {
      return Object.assign({}, state, {
        text: action.payload
      });
    },
    throw(state, action) {
      console.log(action.payload);
      return {};
    }
  },
  [SHOW_MORE_DIALOG]: {
    next(state, action) {
      return Object.assign({}, state, {
        isShowMoreDialog: action.payload
      });
    }
  }
}, { text: '3秒后触发同步action', isShowMoreDialog: false });