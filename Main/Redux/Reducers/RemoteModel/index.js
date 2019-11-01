import { handleActions } from 'redux-actions';
import {
  UPDATE_REMOTE,
  UPDATE_REMOTE_MODEL
} from '../../Actions/ActionTypes';
import LHRemote from '../../../Model/LHRemote';

const defaultRemoteModel = new LHRemote();

export default handleActions({
  [UPDATE_REMOTE]: {
    next(state, action) {
      return action.payload;
    }
  },
  [UPDATE_REMOTE_MODEL]: {
    next(state, action) {
      return action.payload;
    },
    throw(state, action) {
      console.warn(action.payload);
      return {};
    }
  }
}, defaultRemoteModel);