import { createAction } from 'redux-actions';
import {
  UPDATE_REMOTE,
  UPDATE_REMOTE_MODEL,
  UPDATE_REMOTE_MODEL_CACHE
} from '../ActionTypes';
import LHRemoteUtils from '../../../Utils/LHRemoteUtils';
import LHRemote from '../../../Model/LHRemote';

const UpdateRemote = createAction(UPDATE_REMOTE, (remote) => {
  return remote;
});


const UpdateRemoteModelRemotely = createAction(UPDATE_REMOTE_MODEL, (controllerId, brandId) => {
  return LHRemoteUtils.fetchRemoteModel(controllerId)
    .then((res) => {
      const remote = new LHRemote({ controllerId, brandId, remoteModel: res });
      return remote;
    });
});


const UpdateRemoteModelWithCache = createAction(UPDATE_REMOTE_MODEL_CACHE, () => {

});

const UpdateRemoteModelActions = {
  UpdateRemote,
  UpdateRemoteModelRemotely,
  UpdateRemoteModelWithCache
};

export default UpdateRemoteModelActions;