import Device from 'miot/Device';
import LHAcPartner from '../Model/LHAcPartner';
import LHProfileHost from './LHProfileHost';
import LHSpecHost from './LHSpecHost';


const getInstance = (model) => {
  if (!this.instance) {
    if (model === LHAcPartner.ACPARTNER_MCN02_DEVICE_MODEL) {
      this.instance = new LHProfileHost();
    } else {
      this.instance = new LHSpecHost();
    }
  }
  return this.instance;
};

const LHRpcHost = getInstance(Device.model);

export default LHRpcHost;
