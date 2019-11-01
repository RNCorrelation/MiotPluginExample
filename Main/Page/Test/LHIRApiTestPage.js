import React from 'react';
import {
  View,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import {
  Device
} from 'miot';
import { LHText } from 'LHCommonUI';
import ircontroller from 'miot/service/ircontroller';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UpdateRemoteModelActions from '../../Redux/Actions/RemoteModel';
import UpdateStatusActions from '../../Redux/Actions/AcControl';
import LHAcNonCmdSender from '../../Command/LHAcNonCmdSender';

let acDid;

class LHIRApiTestPage extends React.Component {
  getRemoteModel() {
    const { Remote } = this.props;
    return JSON.stringify(Remote);
  }

  getStatus() {
    const { AcStatus } = this.props;
    return JSON.stringify(AcStatus);
  }

  getNonStatusKeys() {
    const { Remote } = this.props;
    const { remoteModel } = Remote;
    if (!remoteModel) return null;
    const { keys } = remoteModel;
    let content = null;
    if (Array.isArray(keys)) {
      content = keys.map((item) => {
        const { id, name, display_name: disName } = item;
        return (
          <TouchableHighlight
            style={{ backgroundColor: '#ffa', height: 50 }}
            onPress={() => {
              const { controllerId } = Remote;
              console.warn('Send non status key ' + id);
              LHAcNonCmdSender.sendNonStatusCommand(id, controllerId);
            }}
          >
            <LHText>{id + name + disName}</LHText>
          </TouchableHighlight>
        );
      });
    }
    return content;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <TouchableHighlight
            style={{ backgroundColor: '#faf', height: 50 }}
            onPress={() => {
              ircontroller.controllerAdd({ name: 'test_lumi', parent_id: Device.deviceID, category: 5 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                  const { result } = res;
                  const { did } = result;
                  acDid = did;
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>controllerAdd</LHText>
          </TouchableHighlight>
          <TouchableHighlight
            style={{ backgroundColor: '#ffa', height: 50 }}
            onPress={() => {
              ircontroller.controllerDel({ did: acDid })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>controllerDel</LHText>
          </TouchableHighlight>
          <TouchableHighlight
            style={{ backgroundColor: '#afa', height: 50 }}
            onPress={() => {
              ircontroller.getList({ parent_id: Device.deviceID })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getList</LHText>
          </TouchableHighlight>
          <TouchableHighlight
            style={{ backgroundColor: '#faa', height: 50 }}
            onPress={() => {
            // ircontroller.getKeys({ controller_id: '11277' })
              ircontroller.getKeys({ did: acDid })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getKeys</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#ffa', height: 50 }}
            onPress={() => {
              ircontroller.getBrands({ category: 5 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getBrands</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#f8a', height: 50 }}
            onPress={() => {
              ircontroller.sendKey({ did: Device.deviceID, controller_id: 11797, ac_key: 'M0_T18_S0' })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>sendKey 11797 M0_T18_S0</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#fca', height: 50 }}
            onPress={() => {
              ircontroller.sendKey({ did: Device.deviceID, controller_id: 11277, key_id: 1 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>sendKey 11277 key_id：1</LHText>
          </TouchableHighlight>


          <TouchableHighlight
            style={{ backgroundColor: '#afa', height: 50 }}
            onPress={() => {
              // MARK: - getIrCodeFunctions
              ircontroller.getIrCodeFunctions({ controller_id: 11797 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getIrCodeFunctions 11797 有状态</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#afa', height: 50 }}
            onPress={() => {
              // MARK: - getIrCodeKeys
              ircontroller.getIrCodeKeys({ controller_id: 11797 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getIrCodeKeys 11797 有状态</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#fca', height: 50 }}
            onPress={() => {
              // MARK: - getIrCodeFunctions
              ircontroller.getIrCodeFunctions({ controller_id: 11277 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getIrCodeFunctions 11277 无状态</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#fca', height: 50 }}
            onPress={() => {
              // MARK: - getIrCodeKeys
              ircontroller.getIrCodeKeys({ controller_id: 11277 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getIrCodeKeys 11277 无状态</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#f8a', height: 50 }}
            onPress={() => {
              // MARK: - getIrCodeBrand
              ircontroller.getIrCodeBrand({ brand_id: 2556 })
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>getIrCodeBrand 2556</LHText>
          </TouchableHighlight>

        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Remote: state.RemoteModelReducers,
    AcStatus: state.StatusActionsReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Object.assign({}, UpdateRemoteModelActions, UpdateStatusActions), dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LHIRApiTestPage);
