import { Host } from 'miot';
import React from 'react';
import {
  Dimensions, View
} from 'react-native';
import {
  LHCommonIcon, LHTitleBarCustom, LHStandardList
} from 'LHCommonUI';
import {
  LHToastUtils, LHDeviceUtils, LHCommonLocalizableString, LHUiUtils, CommonMethod, LHMiServer
} from 'LHCommonFunction';
import PluginConfig from 'PluginConfig';
import Util from '../../Utils/LHBrandUtil';
import LHBrandSearchModal from './LHBrandSearchModal';
import LHAcpartner from '../../Model/LHAcPartner';
import LHAcCloudHost from '../../Host/LHAcCloudHost';
import LHBrandLetters from './LHBrandLetters';
import LHRpcHost from '../../Host/LHRpcHost';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';

const nativeLanguage = Host.locale.language;
const isEnglish = nativeLanguage === 'en';
let sourceData = [];
let letters;
let Instance;
const { width } = Dimensions.get('window');
const ITEM_HEIGHT = LHUiUtils.GetPx(50);
const HEADER_HEIGHT = LHUiUtils.GetPx(33);
const LetterArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

export default class LHBrandListPage extends React.Component {
  static navigationOptions = () => {
    return {
      header: null
    };
  };

  constructor(props) {
    super(props);
    Instance = this;
    this.state = {
      selectedLetter: 'A',
      searchModalVisible: false,
      pageData: [],
      showLetter: false
    };
  }

  search = () => {
    this.setState({
      searchModalVisible: true
    });
  };

  handleBrands = (brandArray, needRefresh) => {
    console.log(brandArray);
    if (brandArray.length === 0) return;
    const nameArray = [];
    brandArray.sort((a, b) => {
      let aIndexName = Util.getIndexName(a.pinyin);
      let bIndexName = Util.getIndexName(b.pinyin);
      if (isEnglish) {
        aIndexName = Util.getIndexName(a.en_name);
        bIndexName = Util.getIndexName(b.en_name);
      }
      return aIndexName.localeCompare(bIndexName);
    });
    for (let index = 0; index < brandArray.length; index += 1) {
      let currentFirstChar = brandArray[index].pinyin[0].toUpperCase();
      if (isEnglish) {
        currentFirstChar = brandArray[index].en_name[0].toUpperCase();
      }
      const tmpDict = {
        firstChar: currentFirstChar,
        id: brandArray[index].id,
        fullName: (isEnglish ? brandArray[index].en_name : brandArray[index].name)
      };
      nameArray.push(tmpDict);
    }
    const resultList = Util.group(nameArray, 'firstChar');
    letters = Object.keys(resultList);

    const allData = [];
    Object.keys(resultList).forEach((key) => {
      const result = resultList[key];
      const data = [];
      for (let index = 0; index < result.length; index += 1) {
        data.push({
          key: result[index].id,
          title: result[index].fullName,
          style: { height: ITEM_HEIGHT },
          marginTop: 1,
          textContainer: {
            alignSelf: 'center'
          },
          rowContainerStyle: {
            flex: 1
          },
          hideRightArrow: true,
          swipeoutClose: true,
          press: () => {
            this.openMatchRemoter(result[index].id);
          }
        });
      }
      allData.push({
        title: key,
        data
      });
    });
    this.setItemLayout(resultList);
    this.allData = allData;

    if (needRefresh) {
      this.setState({
        pageData: []
      });
    }
    // 分批渲染
    this.startRequestAnimationFrame();
    // this.setState({ pageData: allData });
  };

  startRequestAnimationFrame() {
    const renderLength = 2;
    if (this.pageExitFlag) return;
    const remainAllDataLength = this.allData.length;
    let dataAddToRender;
    if (remainAllDataLength <= renderLength) {
      dataAddToRender = this.allData.splice(0, remainAllDataLength);
    } else {
      dataAddToRender = this.allData.splice(0, renderLength);
    }
    const { pageData } = this.state;
    const pageDataCopy = CommonMethod.DeepClone(pageData, []);
    const data = pageDataCopy.concat(dataAddToRender);
    this.setState({
      pageData: data
    });
    if (this.allData.length > 0) {
      window.requestAnimationFrame(() => {
        this.startRequestAnimationFrame();
      });
    } else {
      this.setState({
        showLetter: true
      });
    }
  }

  componentDidMount =() => {
    this.restoreAcBrandListCache().then((cacheData) => {
      if (cacheData) {
        sourceData = cacheData;
        this.handleBrands(sourceData, false);
      }
      LHAcCloudHost.getBrands().then((res) => {
        if (JSON.stringify(cacheData) !== JSON.stringify(res)) {
          sourceData = res;
          this.handleBrands(sourceData, true);
        }
        this.saveAcBrandListCache(res);
      }).catch(() => {
        LHToastUtils.showShortToast(LHCommonLocalizableString.common_operation_fail);
      });
    });
  };

  componentWillUnmount=() => {
    this.pageExitFlag = true;
    this.setState({ searchModalVisible: false });
  };

  restoreAcBrandListCache=() => {
    return LHMiServer.GetHostStorage(PluginConfig.AcBrandListCacheKey);
  };

  saveAcBrandListCache=(arr) => {
    LHMiServer.SetHostStorage(PluginConfig.AcBrandListCacheKey, arr);
  };

  openMatchRemoter=(brandId) => {
    const { navigation } = this.props;
    navigation.navigate('LHMatchRemoterPage', {
      deviceType: LHAcpartner.DEVICE_TYPE_AIR_CONDITIONER,
      brand_id: brandId
    });
    LHRpcHost.enterMatch();
  };

  getIndexInSectionByLetter(letter) {
    const sectionIndex = letters.indexOf(letter);
    if (sectionIndex > -1) {
      return sectionIndex;
    } else {
      let nextLetter;
      if (letter === '#') {
        nextLetter = 'A';
      } else {
        nextLetter = LetterArray[LetterArray.indexOf(letter) + 1];
      }
      return this.getIndexInSectionByLetter(nextLetter);
    }
  }

  /**
   * 没有该字母的品牌向后推移。
   * @param letter
   */
  selectLetter=(letter) => {
    this.scrollToLocationFlag = true;
    if (letters) {
      // let sectionIndex = letters.indexOf(letter);
      // if (sectionIndex < 0) {
      //   sectionIndex = letters.indexOf(LetterArray[LetterArray.indexOf(letter) + 1]);
      // }
      const sectionIndex = this.getIndexInSectionByLetter(letter);
      setTimeout(() => {
        if (this.sectionList) {
          this.sectionList.scrollToLocation(
            sectionIndex,
            0,
            HEADER_HEIGHT
          );
        }
      }, 150);
    }
  };

  setItemLayout=(data) => {
    const [itemHeight, headerHeight] = [ITEM_HEIGHT, HEADER_HEIGHT];//  + LHUiUtils.GetPx(8)];
    const layoutList = [];
    let layoutIndex = 0;
    let layoutOffset = 0;
    let layoutsectionIndex = 0;
    Object.keys(data).forEach((key) => {
      layoutList.push({
        sectionIndex: layoutsectionIndex,
        index: layoutIndex,
        length: headerHeight,
        offset: layoutOffset
      });
      layoutIndex += 1;
      layoutOffset += headerHeight;
      const value = data[key];
      for (let i = 0; i < value.length; i += 1) {
        layoutList.push({
          sectionIndex: layoutsectionIndex,
          index: layoutIndex,
          length: itemHeight,
          offset: layoutOffset
        });
        layoutIndex += 1;
        if (i === (value.length - 1)) {
          layoutOffset += itemHeight + LHUiUtils.GetPx(8);
        } else {
          layoutOffset += itemHeight;
        }
      }
      layoutList.push({
        sectionIndex: layoutsectionIndex,
        index: layoutIndex,
        length: 0,
        offset: layoutOffset
      });
      layoutIndex += 1;
      layoutsectionIndex += 1;
    });
    this.initialNumToRender = layoutIndex;
    this.layoutList = layoutList;
  };

  getItemLayout=(data, dataIndex) => {
    if (this.layoutList) {
      const layout = this.layoutList.filter((n) => { return n.index === dataIndex; })[0];
      if (layout) {
        const { index, length, offset } = layout;
        return { index, length, offset };
      }
    }
    return { index: 0, length: 0, offset: 0 };
  };

  onScroll=(evt) => {
    if (this.scrollToLocationFlag) return;
    const eventY = evt.nativeEvent.contentOffset.y;
    let sectionNum = 0;
    if (this.layoutList) {
      for (let i = 0; i < this.layoutList.length; i += 1) {
        if (this.layoutList[i].offset > eventY) {
          sectionNum = this.layoutList[i].sectionIndex;
          break;
        }
      }
    }
    if (letters) {
      const { selectedLetter: selLetter } = this.state;
      if (selLetter !== letters[sectionNum]) {
        this.setState({ selectedLetter: letters[sectionNum] });
      }
    }
  };

  keyExtractor = (item) => {
    return item.key;
  };


  render() {
    const {
      searchModalVisible, selectedLetter, pageData, showLetter
    } = this.state;
    return (
      <View style={{
        width: '100%',
        height: '100%',
        position: 'absolute'
      }}
      >
        <View style={{
          width: '100%',
          height: '100%',
          backgroundColor: LHUiUtils.MiJiaWhite,
          position: 'absolute'
        }}
        >
          <LHTitleBarCustom
            title={LHLocalizedStrings.mi_acpartner_choose_brand}
            showSeparator
            onPressLeft={() => {
              const { navigation } = this.props;
              navigation.goBack();
            }}
            rightButtons={[{
              source: LHCommonIcon.navigation.search.normal,
              highlightedSource: LHCommonIcon.navigation.search.press,
              bottomSeparatorLine: true,
              press: () => {
                if (Instance) {
                  Instance.search();
                }
              }
            }]}
          />
          <View style={{
            flex: 1,
            flexDirection: 'row'
          }}
          >
            <LHStandardList
              onMomentumScrollBegin={() => {
                this.scrollToLocationFlag = false;
              }}
              initialNumToRender={this.initialNumToRender || 300}
              getItemLayout={this.getItemLayout}
              scrollEnable
              ref={(view) => { this.sectionList = view; }}
              keyExtractor={this.keyExtractor}
              style={{
                width: (width - LHUiUtils.GetPx(16)),
                backgroundColor: LHUiUtils.MiJiaBackgroundGray,
                marginBottom: LHDeviceUtils.AppHomeIndicatorHeight
              }}
              sectionHeaderStyle={{
                height: LHUiUtils.GetPx(33)
              }}
              cellContainerStyle={{
                flex: 1
              }}
              stickySectionHeadersEnabled
              data={pageData}
              onScroll={(evt) => {
                this.onScroll(evt);
              }}
            />
            {
              (
                <LHBrandLetters
                  ready={showLetter}
                  selectLetter={selectedLetter}
                  onSelected={(letter) => {
                    this.selectLetter(letter);
                  }}
                />
              )
            }
          </View>
        </View>
        <LHBrandSearchModal
          show={searchModalVisible}
          brandList={sourceData}
          onSelected={(brandId) => {
            this.setState({ searchModalVisible: false });
            this.openMatchRemoter(brandId);
          }}
          onBack={() => {
            this.setState({ searchModalVisible: false });
          }}
        />
      </View>
    );
  }
}
