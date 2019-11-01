import { StyleSheet, View, Dimensions } from 'react-native';
import { LHTitleBarCustom, LHText, LHImageButton } from 'LHCommonUI';
import { Device } from 'miot';
import React from 'react';
import {
  LHUiUtils, LHDialogUtils, LHCommonLocalizableString, LHToastUtils, LHPureRenderDecorator, CommonMethod, LHDeviceUtils
} from 'LHCommonFunction';

import Resources from 'Resources';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PluginConfig from '../../PluginConfig';
import ircontroller from '../../../../../miot-sdk/service/ircontroller';
import LHAcpartner from '../../Model/LHAcPartner';
import LHAcCloudHost from '../../Host/LHAcCloudHost';
import LHRpcHost from '../../Host/LHRpcHost';
import LHAcStatusAsset from '../../Model/LHAcStatusAsset';
import UpdateRemoteModelActions from '../../Redux/Actions/RemoteModel';
import UpdateStatusActions from '../../Redux/Actions/AcControl';
import LHRemote from '../../Model/LHRemote';
import LHRemoteUtils from '../../Utils/LHRemoteUtils';
import LHAcStatus from '../../Model/LHAcStatus';
import LHAcStatusCommand from '../../Command/LHAcStatusCommand';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';
import LHCommonStyle from '../../Styles/LHCommonStyle';
import LHPageUtils from '../../Utils/LHPageUtils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'center',
    backgroundColor: LHUiUtils.MiJiaBackgroundGray
  },
  topText: {
    textAlign: 'center',
    fontSize: LHUiUtils.GetPx(18),
    color: PluginConfig.MainTextcolor,
    marginLeft: LHUiUtils.GetPx(24),
    marginRight: LHUiUtils.GetPx(24)
  },
  topDescText: {
    textAlign: 'center',
    fontSize: LHUiUtils.GetPx(15),
    color: PluginConfig.MainTextDetailcolor,
    marginTop: LHUiUtils.GetPx(7),
    marginLeft: LHUiUtils.GetPx(24),
    marginRight: LHUiUtils.GetPx(24)
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: LHUiUtils.GetPx(85)
  },
  bottomStatuText: {
    textAlign: 'center',
    fontSize: LHUiUtils.GetPx(18),
    color: PluginConfig.MainTextcolor,
    marginTop: LHUiUtils.GetPx(15),
    marginLeft: LHUiUtils.GetPx(24),
    marginRight: LHUiUtils.GetPx(24)
  },
  bottomIDText: {
    textAlign: 'center',
    fontSize: LHUiUtils.GetPx(15),
    color: PluginConfig.MainTextDetailcolor,
    marginTop: LHUiUtils.GetPx(2),
    marginLeft: LHUiUtils.GetPx(24),
    marginRight: LHUiUtils.GetPx(24)
  },
  sendBtn: {
    height: LHUiUtils.GetPx(80),
    width: LHUiUtils.GetPx(80)
  }
});
let Instance;
const { height } = Dimensions.get('window');

class LHMatchRemoterPage extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <View>
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_match_ac}
            style={[LHCommonStyle.navigatorWithBorderBotoom]}
            onPressLeft={() => {
              navigation.goBack();
            }}
          />
        </View>
      )
    };
  };

  constructor(props) {
    super(props);
    Instance = this;
    const brandId = props.navigation.state.params.brand_id;
    this.state = {
      screenHeight: height,
      brandId,
      rawDataArray: [], // 原始数据数组
      currentSelectModel: {} // 当前显示在页面的model
    };
  }

  componentDidMount() {
    this.getScreenHeight();
  }

  componentWillMount() {
    this.setupData();
  }

  componentWillUnmount() {
    LHRpcHost.exitMatch();
  }

  /* 1.所有遥控器ID */
  setupData() {
    const { brandId } = this.state;
    LHAcCloudHost.getMatchTree(brandId).then((res) => {
      this.dealData(res);
    }).catch((error) => {
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
      console.log('️获取某品牌某设备类型下的匹配遥控器ID失败', error);
    });
  }

  dealData = (dataArray) => {
    if (dataArray && dataArray.length > 0) {
      const currentModel = dataArray[0];
      this.setState({ currentSelectModel: currentModel, rawDataArray: dataArray });
    }
  }

  nextIrNode = () => {
    const { currentSelectModel, rawDataArray } = this.state;
    if (rawDataArray && rawDataArray.length > 0) {
      rawDataArray.some((irNode) => {
        if (irNode.id === currentSelectModel.mismatched) {
          this.setState({ currentSelectModel: irNode });
          return true;
        }
        return false;
      });
    }
  }

  preIrNode = () => {
    const { currentSelectModel, rawDataArray } = this.state;
    if (rawDataArray && rawDataArray.length > 0) {
      rawDataArray.some((irNode) => {
        if (irNode.cursor + 1 === currentSelectModel.cursor) {
          this.setState({ currentSelectModel: irNode });
          return true;
        }
        return false;
      });
    }
  }

  sendKey = (controllerId, key) => {
    if (key === undefined) {
      return;
    }
    const {
      ac_key: acKey, id
    } = key;
    let param;
    if (acKey) {
      param = {
        did: Device.deviceID,
        controller_id: controllerId,
        ac_key: acKey
      };
    } else if (id) {
      param = {
        did: Device.deviceID,
        controller_id: controllerId,
        key_id: id
      };
    }
    if (param) {
      ircontroller.sendKey(param)
        .then((response) => {
          this.showMatchDialog();
          console.log('Post_SendMatchkeyCode' + JSON.stringify(response));
        })
        .catch((error) => {
          console.log('normalButton_onPressButton---error---' + JSON.stringify(error));
        });
    }
  };

  showMatchDialog = () => {
    LHDialogUtils.MessageDialogShow({
      message: LHLocalizedStrings.mi_acpartner_ele_response,
      confirm: LHLocalizedStrings.mi_acpartner_yes,
      cancel: LHLocalizedStrings.mi_acpartner_no,
      confirmStyle: {
        color: LHUiUtils.MiJiaSubTitleColor
      },
      onConfirm() {
        if (Instance) {
          Instance.matchIrNode();
        }
      },
      onCancel() {
        if (Instance) {
          Instance.misMatchIrNode();
        }
      }
    });
  };

  misMatchIrNode = () => {
    const { currentSelectModel } = this.state;
    const { mismatched } = currentSelectModel;
    if (mismatched > 0) {
      this.nextIrNode();
    } else {
      this.matchFailed();
    }
  }

  matchIrNode = () => {
    const { currentSelectModel, rawDataArray, brandId } = this.state;
    const { matched } = currentSelectModel;
    if (matched && matched > 0 && rawDataArray && rawDataArray.length > 0) {
      rawDataArray.some((irNode) => {
        if (irNode.id === matched) {
          this.setState({ currentSelectModel: irNode });
          return true;
        }
        return false;
      });
    } else {
      setTimeout(() => {
        this.matchSucess(currentSelectModel.controller_id, brandId);
      }, 300);
    }
  }

  matchFailed = () => {
    const { navigation } = this.props;
    LHPageUtils.goMatchFailedPage(navigation);
    LHRpcHost.exitMatch();
  };

  /**
   *
   * 1.获取有、无状态空调码库数据
   * 2.保存品牌ID,遥控器ID，有无状态空调 数据给固件
   * 3.有状态空调发送码库给固件
   * ====跳转到匹配成功页面====
   * 4.更新状态到redux,缓存。
   * 5.有状态空调发送默认码
   * 6.退出匹配状态
   */

  matchSucess = (controllerId, brandId) => {
    LHDialogUtils.LoadingDialogShow({ title: LHCommonLocalizableString.common_log_loading });
    LHRemoteUtils.fetchRemoteModel(controllerId).then((remoteModel) => {
      const newRemote = new LHRemote({ brandId, controllerId, remoteModel });
      LHRpcHost.setAcModel(brandId, controllerId, newRemote.isStatusRemote() ? LHAcpartner.AcStateCondition : LHAcpartner.AcStateConditionNone).then(() => {
        if (newRemote.isStatusRemote() && PluginConfig.IsSupportRpcIRControl()) {
          const remoteModelCopy = CommonMethod.DeepClone(remoteModel);
          const { modes, swing } = remoteModelCopy;
          LHRpcHost.setRemoteListCrc(controllerId, { modes, swing }).then(() => {
            LHDialogUtils.LoadingDialogHide();
            const { navigation } = this.props;
            LHPageUtils.goMatchSuccessPage(navigation);
            this.matchSucessAfter(newRemote, brandId, controllerId);
          }).catch((err0) => {
            console.log(err0);
            LHDialogUtils.LoadingDialogHide();
            LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
          });
        } else {
          LHDialogUtils.LoadingDialogHide();
          const { navigation } = this.props;
          LHPageUtils.goMatchSuccessPage(navigation);
          this.matchSucessAfter(newRemote, brandId, controllerId);
        }
      }).catch((err) => {
        console.log(err);
        LHDialogUtils.LoadingDialogHide();
        LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
      });
    }).catch((err2) => {
      console.log(err2);
      LHDialogUtils.LoadingDialogHide();
      LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
    });
  };

  /**
   * 1.更新状态到redux,缓存。
   * 2.有状态空调发送默认码
   * 3.退出匹配状态
   */
  matchSucessAfter = (newRemote, brandId, controllerId) => {
    const { UpdateRemote } = this.props;
    UpdateRemote(newRemote);
    LHRpcHost.saveAcModelCache(brandId, controllerId);
    if (newRemote.isStatusRemote()) {
      const acStatus = new LHAcStatus();
      acStatus.powerState = 1;
      acStatus.modeState = 0;
      acStatus.temperature = 25;
      acStatus.windSpeed = 3;
      acStatus.swingState = 0;
      const acCommond = LHAcStatusCommand.powerCommandFromStatus(acStatus, newRemote);
      ircontroller.sendKey({ did: Device.deviceID, controller_id: controllerId, ac_key: acCommond });
    }
    LHRpcHost.exitMatch();
  }

  getScreenHeight() {
    LHDeviceUtils.GetPhoneScreenHeight((value) => {
      this.setState({ screenHeight: value });
    });
  }

  render() {
    const { currentSelectModel, screenHeight } = this.state;
    const {
      controller_id: controllerId, cursor, total, key
    } = currentSelectModel;
    let matchBottomStatusText;
    if (key) {
      const { ac_key: acKey, display_name: displayName, name } = key;
      matchBottomStatusText = acKey ? LHAcStatusAsset.acMatchDespWithStatus(acKey) : (LHAcpartner.isChina ? displayName : name);
    }
    const isFirst = (cursor === 1 || cursor === undefined);
    const isLast = (cursor === total);
    const matchBottomIDText = controllerId && controllerId > 0 ? ('ID:' + controllerId + ' (' + cursor + '/' + total + ')') : '';

    let marginTop = 145 * screenHeight / 780;
    const gap = marginTop - LHUiUtils.GetPx(145);
    marginTop += (gap > 0 ? gap : 2 * gap) / 3;

    return (
      <View style={styles.container}>
        <LHText
          style={[styles.topText, { marginTop }]}
        >
          {LHLocalizedStrings.mi_acpartner_match_btn_response}
        </LHText>
        <LHText
          style={styles.topDescText}
        >
          {LHLocalizedStrings.mi_acpartner_match_btn_response_await}
        </LHText>
        <View style={styles.rowContainer}>
          <LHImageButton
            source={Resources.MatchImage.arrowLeftIcon}
            style={{
              justifyContent: 'center',
              opacity: isFirst ? 0 : 1,
              height: LHUiUtils.GetPx(23),
              width: LHUiUtils.GetPx(13),
              marginTop: LHUiUtils.GetPx(20),
              marginBottom: LHUiUtils.GetPx(20),
              marginLeft: LHUiUtils.GetPx(20),
              marginRight: LHUiUtils.GetPx(60)
            }}
            onPress={() => { this.preIrNode(); }}
          />
          <LHImageButton
            source={Resources.MatchImage.matchIcon}
            style={styles.sendBtn}
            onPress={() => { this.sendKey(controllerId, key); }}
          />
          <LHImageButton
            source={Resources.MatchImage.arrowRightIcon}
            style={{
              justifyContent: 'center',
              opacity: isLast ? 0 : 1,
              height: LHUiUtils.GetPx(23),
              width: LHUiUtils.GetPx(13),
              marginTop: LHUiUtils.GetPx(20),
              marginBottom: LHUiUtils.GetPx(20),
              marginRight: LHUiUtils.GetPx(20),
              marginLeft: LHUiUtils.GetPx(60)
            }}
            onPress={() => { this.nextIrNode(); }}
          />
        </View>
        <LHText style={styles.bottomStatuText}>
          {matchBottomStatusText}
        </LHText>
        <LHText style={styles.bottomIDText}>
          {matchBottomIDText}
        </LHText>
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

export default connect(mapStateToProps, mapDispatchToProps)(LHPureRenderDecorator(LHMatchRemoterPage));