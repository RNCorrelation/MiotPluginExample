import React from 'react';
import {
  View,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import {
  LHText, LHStandardCell
} from 'LHCommonUI';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UpdateRemoteModelActions from '../../Redux/Actions/RemoteModel';
import UpdateStatusActions from '../../Redux/Actions/AcControl';
import LHAcNonCmdSender from '../../Command/LHAcNonCmdSender';

class LHIRTestPage extends React.Component {
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
            style={{ backgroundColor: '#faa', height: 50 }}
            onPress={() => {
              const { navigation } = this.props;
              navigation.navigate('LHIRApiTestPage');
            }}
          >
            <LHText>LHIRApiTestPage</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#ffa', height: 50 }}
            onPress={() => {
              const { GetAcDeviceStatus } = this.props;
              GetAcDeviceStatus()
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>GetAcDeviceStatus</LHText>
          </TouchableHighlight>


          <TouchableHighlight
            style={{ backgroundColor: '#afa', height: 50 }}
            onPress={() => {
              const { UpdateRemoteModelRemotely } = this.props;
              UpdateRemoteModelRemotely(11797, 11797)
                .then((res) => {
                  console.warn(JSON.stringify(res));
                })
                .catch((err) => {
                  console.warn(JSON.stringify(err));
                });
            }}
          >
            <LHText>fetchRemoteModel</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#afa', height: 50 }}
            onPress={() => {
              const { navigation } = this.props;
              navigation.navigate('LHFileTestPage');
            }}
          >
            <LHText>goto文件管理</LHText>
          </TouchableHighlight>

          <TouchableHighlight
            style={{ backgroundColor: '#afa', height: 50 }}
            onPress={() => {
              const { navigation } = this.props;
              navigation.navigate('ImagePickerDemo');
            }}
          >
            <LHText>goto图片选择</LHText>
          </TouchableHighlight>

          <LHStandardCell
            title="开关"
            showSliderView
            sliderProps={{ minimumValue: 0, maximumValue: 1, value: 0 }}
            onSlidingComplete={(value) => {
              const { SetStatusAcPower, Remote, AcStatus } = this.props;
              SetStatusAcPower(value, { status: AcStatus, remoteModel: Remote });
            }}
          />
          <LHStandardCell
            title="模式"
            showSliderView
            sliderProps={{ minimumValue: 0, maximumValue: 6, value: 0 }}
            onSlidingComplete={(value) => {
              const { SetStatusAcMode, Remote, AcStatus } = this.props;
              SetStatusAcMode(value, { status: AcStatus, remoteModel: Remote });
            }}
          />
          <LHStandardCell
            title="温度"
            showSliderView
            sliderProps={{ minimumValue: 16, maximumValue: 32, value: 26 }}
            onSlidingComplete={(value) => {
              const { SetStatusAcTemperature, Remote, AcStatus } = this.props;
              SetStatusAcTemperature(value, { status: AcStatus, remoteModel: Remote });
            }}
          />
          <LHStandardCell
            title="风速"
            showSliderView
            sliderProps={{ minimumValue: 0, maximumValue: 6, value: 1 }}
            onSlidingComplete={(value) => {
              const { SetStatusAcWindSpeed, Remote, AcStatus } = this.props;
              SetStatusAcWindSpeed(value, { status: AcStatus, remoteModel: Remote });
            }}
          />
          <LHStandardCell
            title="扫风"
            showSliderView
            sliderProps={{ minimumValue: 0, maximumValue: 3, value: 1 }}
            onSlidingComplete={(value) => {
              const { SetStatusAcSwing, Remote, AcStatus } = this.props;
              SetStatusAcSwing(value, { status: AcStatus, remoteModel: Remote });
            }}
          />

          {this.getNonStatusKeys()}

          <LHText>============ ac status ============</LHText>
          <LHText>{this.getStatus()}</LHText>
          <LHText>============ remote model ============</LHText>
          <LHText>{this.getRemoteModel()}</LHText>


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

export default connect(mapStateToProps, mapDispatchToProps)(LHIRTestPage);
