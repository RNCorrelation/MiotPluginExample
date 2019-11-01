import React from 'react';
import {
  Image, ImageBackground, StyleSheet, TouchableWithoutFeedback, View
} from 'react-native';
import Base64 from 'base64-js';
import {
  LHDialogUtils, LHToastUtils, LHUiUtils, LHCommonLocalizableString
} from 'LHCommonFunction';
import { LHText } from 'LHCommonUI';
import Resources from 'Resources';
import ImagePicker from 'react-native-image-picker';
import Device from 'miot/Device';
import Host from 'miot/Host';
import Service from 'miot/Service';
import LHBaseArtificialMatchingPage from './LHBaseArtificialMatchingPage';
import LHLocalizedString from '../../Localized/LHLocalizableString';
import LHAcCloudHost from '../../Host/LHAcCloudHost';

const styles = StyleSheet.create({
  topTipsStyle: {
    marginTop: LHUiUtils.GetPx(24),
    marginLeft: LHUiUtils.GetPx(24),
    marginRight: LHUiUtils.GetPx(24),
    marginBottom: LHUiUtils.GetPx(24),
    fontSize: LHUiUtils.GetPx(15),
    alignSelf: 'center',
    color: '#333333'
  },
  frontBackgroundStyle: {
    flex: 1,
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBackgroundStyle: {
    flex: 1,
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10),
    marginTop: LHUiUtils.GetPx(10),
    marginBottom: LHUiUtils.GetPx(51),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  frontImageStyle: {
    flex: 1,
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10),
    borderRadius: LHUiUtils.GetPx(10),
    borderWidth: LHUiUtils.GetPx(1),
    borderColor: 'rgba(229,229,229,1)'
  },
  backImageStyle: {
    flex: 1,
    marginLeft: LHUiUtils.GetPx(10),
    marginRight: LHUiUtils.GetPx(10),
    marginTop: LHUiUtils.GetPx(10),
    marginBottom: LHUiUtils.GetPx(51),
    borderRadius: LHUiUtils.GetPx(10),
    borderWidth: LHUiUtils.GetPx(1),
    borderColor: 'rgba(229,229,229,1)'
  }
});

export default class LHUploadRemoteControlPage extends LHBaseArtificialMatchingPage {
  constructor(props) {
    super(props);
    this.state = {
      title: LHLocalizedString.mi_acpartner_artificial_matching_upload_remote_control_pic,
      uploadProcess: Resources.MatchImage.uploadProcessA,
      bottomBtText: LHLocalizedString.mi_acpartner_artificial_matching_next_step,
      bottomTipsText: LHLocalizedString.mi_acpartner_artificial_matching_photo_submit_failed,
      bottomTipsColor: 'rgba(244,63,49,1)',
      showBottomTips: false,
      frontPhotoSource: undefined,
      backPhotoSource: undefined,
      frontResponse: undefined,
      backResponse: undefined,
      selectDisabled: false,
      bottomBtDisabled: true
    };
    this.isBackPressed = false;
  }

  onBackPressed = () => {
    this.isBackPressed = true;
    const { navigation } = this.props;
    navigation.goBack();
  };

  bottomBtClick = () => {
    const {
      frontResponse,
      backResponse
    } = this.state;
    if (!frontResponse) {
      LHToastUtils.showShortToast(LHLocalizedString.mi_acpartner_artificial_matching_please_set_front);
      return;
    }
    if (!backResponse) {
      LHToastUtils.showShortToast(LHLocalizedString.mi_acpartner_artificial_matching_please_set_front);
      return;
    }
    console.log('uploadFileToFDS frontResponse ', frontResponse);
    console.log('uploadFileToFDS backResponse ', frontResponse);
    this.uploadFileStart();
    const fns = [];
    fns.push(this.uploadFileToFDS(frontResponse));
    fns.push(this.uploadFileToFDS(backResponse));
    Promise.all(fns).then((res) => {
      console.log(' uploadFileToFDS ', res);
      if (res) {
        this.uploadFeedbackRemoteURL(res);
      } else {
        this.uploadFileFailed();
      }
    }).catch((err) => {
      console.log('uploadFileToFDS failed ', err);
      this.uploadFileFailed();
    });
  };

  uploadFileStart = () => {
    this.setState({
      showBottomTips: false,
      selectDisabled: true,
      bottomBtDisabled: true
    });
    LHDialogUtils.LoadingDialogShow({ title: LHLocalizedString.mi_acpartner_artificial_matching_upload });
  };

  uploadFileSuccess = (time) => {
    LHDialogUtils.LoadingDialogHide();
    setTimeout(() => {
      if (!this.isBackPressed) {
        const { navigation } = this.props;
        navigation.replace('LHSubmitInfraredCodePage', { ir_learn_time: time });
      }
    }, 700);
  };

  uploadFileFailed = () => {
    LHDialogUtils.LoadingDialogHide();
    this.setState({
      showBottomTips: true,
      selectDisabled: false,
      bottomBtText: LHLocalizedString.mi_acpartner_artificial_matching_retry,
      bottomBtDisabled: false
    });
  };

  uploadFileToFDS = (response) => {
    return new Promise((resolve, reject) => {
      if (!response.fileName && !response.uri) {
        reject(new Error('fileName or uri is null '));
        return;
      }
      if (!response.data) {
        reject(new Error('data is null '));
        return;
      }
      const did = Device.deviceID;
      const fileName = response.fileName || response.uri;
      const index = fileName.lastIndexOf('.') + 1;
      const suffix = fileName.substring(index, fileName.length);
      console.log('uploadFileToFDS suffix ', suffix);
      Host.file.generateObjNameAndUrlForFDSUpload(did, suffix).then((res) => {
        console.log('pre upload', res);
        if (res && Object.prototype.hasOwnProperty.call(res, suffix) && res[suffix]) {
          const obj = res[suffix];
          // eslint-disable-next-line camelcase
          const { obj_name } = obj;
          const nameIndex = obj_name.lastIndexOf('/') + 1;
          const name = obj_name.substring(nameIndex, obj_name.length);
          console.log('writeFile name ', name);
          const uint8Data = Base64.toByteArray(response.data).buffer;
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = (e) => {
            console.log('onreadystatechange ', e);
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                // 显示上传成功后的图片地址
                const rr = xhr.responseText;
                resolve(rr);
              } else {
                reject(new Error('Problem retrieving XML data ' + xhr.status));
              }
            }
          };
          xhr.open(obj.method, obj.url, true);
          xhr.setRequestHeader('Content-Type', '');
          xhr.send(uint8Data);
          /* Host.file.writeFileThroughBase64(name, response.data).then(() => {
            const params = {
              uploadUrl: obj.url,
              method: obj.method,
              headers: { 'Content-Type': '' },
              files: [{ filename: name }]
            };
            Host.file.uploadFileToFDS(params).then((rr) => {
              resolve(rr);
            }).catch((err) => {
              console.log('upload file failed', err);
              reject(err);
            });
          }).catch((err) => {
            console.log('write file failed', err);
            reject(err);
          }); */
        } else {
          reject(new Error(suffix + ' not support'));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  };

  uploadFeedbackRemoteURL = (result) => {
    let brandCap = '';
    result.forEach((rr) => {
      const data = JSON.parse(rr);
      brandCap += data.bucketName + '/' + data.objectName + ',';
    });
    brandCap = brandCap.substring(0, brandCap.length - 1);
    const data = {
      uid: Service.account.ID,
      did: Device.deviceID,
      brandCap
    };
    console.log('uploadFeedbackRemoteURL brandCap ', brandCap);
    fetch('https://app-api.aqara.cn/api/v1/ir/feedback/remote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(data)
    }).then((response) => {
      console.log('uploadFeedbackRemoteURL response ', response);
      if (response.ok || response.status === 200) {
        this.setUserConfigsData();
      } else {
        this.uploadFileFailed();
      }
    }).catch((err) => {
      console.log('uploadFeedbackRemoteURL err ', err);
      this.uploadFileFailed();
    });
  };

  setUserConfigsData = () => {
    LHAcCloudHost.setUserConfigsData((time) => {
      this.uploadFileSuccess(time);
    },
    () => {
      this.uploadFileFailed();
    });
  };

  selectFrontPhotoTapped = () => {
    this.showImagePicker((response) => {
      const {
        backResponse
      } = this.state;
      const bottomBtDisabled = !(backResponse && response);
      this.setState({
        frontPhotoSource: { uri: response.uri },
        frontResponse: response,
        bottomBtDisabled
      });
    });
  };

  selectBackPhotoTapped = () => {
    this.showImagePicker((response) => {
      const {
        frontResponse
      } = this.state;
      const bottomBtDisabled = !(frontResponse && response);
      this.setState({
        backPhotoSource: { uri: response.uri },
        backResponse: response,
        bottomBtDisabled
      });
    });
  };

  showImagePicker = (callback) => {
    const options = {
      title: LHLocalizedString.mi_acpartner_artificial_matching_select_photos,
      cancelButtonTitle: LHCommonLocalizableString.common_cancel,
      takePhotoButtonTitle: LHLocalizedString.mi_acpartner_artificial_matching_photograph,
      chooseFromLibraryButtonTitle: LHLocalizedString.mi_acpartner_artificial_matching_album,
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else if (callback) {
        callback(response);
      }
    });
  };

  getContentView = () => {
    const { frontPhotoSource, backPhotoSource, selectDisabled } = this.state;
    const frontImageBackground = frontPhotoSource ? (
      <TouchableWithoutFeedback
        disabled={selectDisabled}
        style={{ flex: 1 }}
        onPress={() => { this.selectFrontPhotoTapped(); }}
      >
        <Image
          resizeMode="cover"
          style={styles.frontImageStyle}
          source={frontPhotoSource}
        />
      </TouchableWithoutFeedback>
    ) : (
      <TouchableWithoutFeedback
        disabled={selectDisabled}
        style={{ flex: 1 }}
        onPress={() => { this.selectFrontPhotoTapped(); }}
      >
        <ImageBackground
          resizeMode="stretch"
          source={Resources.MatchImage.uploadPhotoCard}
          style={styles.frontBackgroundStyle}
        >
          <TouchableWithoutFeedback
            disabled={selectDisabled}
            onPress={() => { this.selectFrontPhotoTapped(); }}
          >
            <Image
              source={Resources.MatchImage.uploadCamera}
              style={{ width: LHUiUtils.GetPx(59), height: LHUiUtils.GetPx(59) }}
            />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            disabled={selectDisabled}
            onPress={() => { this.selectFrontPhotoTapped(); }}
          >
            <LHText style={{ marginTop: LHUiUtils.GetPx(14), fontSize: LHUiUtils.GetPx(12), color: 'rgba(0,0,0,0.8)' }}>
              {LHLocalizedString.mi_acpartner_artificial_matching_click_shoot_front}
            </LHText>
          </TouchableWithoutFeedback>
        </ImageBackground>
      </TouchableWithoutFeedback>
    );

    const backImageBackground = backPhotoSource ? (
      <TouchableWithoutFeedback
        disabled={selectDisabled}
        style={{ flex: 1 }}
        onPress={() => { this.selectBackPhotoTapped(); }}
      >
        <Image
          resizeMode="cover"
          style={styles.backImageStyle}
          source={backPhotoSource}
        />
      </TouchableWithoutFeedback>
    ) : (
      <TouchableWithoutFeedback
        disabled={selectDisabled}
        style={{ flex: 1 }}
        onPress={() => { this.selectBackPhotoTapped(); }}
      >
        <ImageBackground
          resizeMode="stretch"
          source={Resources.MatchImage.uploadPhotoCard}
          style={styles.backBackgroundStyle}
        >
          <TouchableWithoutFeedback
            disabled={selectDisabled}
            onPress={() => { this.selectBackPhotoTapped(); }}
          >
            <Image
              source={Resources.MatchImage.uploadCamera}
              style={{ width: LHUiUtils.GetPx(59), height: LHUiUtils.GetPx(59) }}
            />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            disabled={selectDisabled}
            onPress={() => { this.selectBackPhotoTapped(); }}
          >
            <LHText style={{ marginTop: LHUiUtils.GetPx(14), fontSize: LHUiUtils.GetPx(12), color: 'rgba(0,0,0,0.8)' }}>
              {LHLocalizedString.mi_acpartner_artificial_matching_click_shoot_back}
            </LHText>
          </TouchableWithoutFeedback>
        </ImageBackground>
      </TouchableWithoutFeedback>
    );
    return (
      <View style={{ flex: 1 }}>
        <LHText style={styles.topTipsStyle}>
          {LHLocalizedString.mi_acpartner_artificial_matching_please_upload_front_back}
        </LHText>
        {frontImageBackground}
        {backImageBackground}
      </View>
    );
  };
}