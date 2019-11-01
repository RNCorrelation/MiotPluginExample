import React from 'react';
import {
  StyleSheet, TextInput, TouchableOpacity, View
} from 'react-native';
import {
  LHUiUtils, LHDeviceUtils
} from 'LHCommonFunction';
import {
  LHCommonIcon, LHStandardEmpty, LHStandardList, LHImageButton, LHText, LHSeparator
} from 'LHCommonUI';
import Resource from 'Resources';
import PluginConfig from '../../PluginConfig';
import LHAcpartner from '../../Model/LHAcPartner';
import LHLocalizedStrings from '../../Localized/LHLocalizableString';

const styles = StyleSheet.create({
  searchContainer: {
    height: LHUiUtils.GetPx(52),
    backgroundColor: LHUiUtils.MiJiaWhite,
    paddingTop: LHUiUtils.GetPx(6),
    paddingBottom: LHUiUtils.GetPx(10),
    paddingLeft: LHUiUtils.GetPx(10),
    paddingRight: LHUiUtils.GetPx(10)
  },
  searchContentView: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: LHUiUtils.GetPx(36),
    borderRadius: LHUiUtils.GetPx(6),
    backgroundColor: PluginConfig.BrandSearchBgcolor
  },
  searchBack: {
    alignSelf: 'center',
    height: LHUiUtils.GetPx(16),
    width: LHUiUtils.GetPx(8)
  },

  input: {
    fontSize: LHUiUtils.GetPx(13),
    color: '#000000',
    flex: 340,
    textAlign: 'left',
    marginHorizontal: LHUiUtils.GetPx(8)
  },
  backButton: {
    flex: 44,
    marginLeft: LHUiUtils.GetPx(16),
    marginRight: LHUiUtils.GetPx(10),
    alignSelf: 'center',
    height: LHUiUtils.GetPx(16),
    width: LHUiUtils.GetPx(8)
  }
});

export default class LHBrandSearchModal extends React.Component {
  static defaultProps = {
    show: false,
    brandList: [],
    autoCloseWhenSelected: true,
    onSelected() {

    },
    onBack() {

    }
  };

  constructor(props) {
    super(props);
    const {
      show,
      brandList,
      autoCloseWhenSelected,
      onSelected,
      onBack
    } = this.props;
    this.state = {
      show,
      searchText: '',
      brandList,
      autoCloseWhenSelected,
      onSelected,
      onBack
    };
  }

  componentWillReceiveProps(data) {
    if (typeof data.show !== 'undefined') {
      this.setState({ show: data.show });
    }
    if (typeof data.brandList !== 'undefined') {
      this.setState({ brandList: data.brandList });
    }
  }

  close = () => {
    this.setState({ show: false });
  };

  getTitle(name) {
    const { searchText } = this.state;
    const trimSearchtext = searchText.replace(/(^\s*)|(\s*$)/g, '');
    const UpperCaseSearchtext = trimSearchtext.toUpperCase();
    const UpperCaseName = name.toUpperCase();
    let index = UpperCaseName.indexOf(UpperCaseSearchtext);
    let start = 0;
    const searchTextLength = trimSearchtext.length;
    const result = [];
    while (index >= start) {
      result.push({
        text: name.substring(start, index),
        type: 'normal'
      });
      start = index;
      result.push({
        text: name.substr(start, searchTextLength),
        type: 'search'
      });
      start += searchTextLength;
      index = start + UpperCaseName.substring(start).indexOf(UpperCaseSearchtext);
    }
    result.push({
      text: name.substr(start),
      type: 'normal'
    });
    return (
      <LHText>
        {
          result.map((data, i) => {
            return (
              <LHText
                // eslint-disable-next-line react/no-array-index-key
                key={'match_' + i}
                style={data.type === 'search' ? { color: PluginConfig.MainColor } : null}
              >
                {data.text}
              </LHText>
            );
          })
        }
      </LHText>
    );
  }

  getPageData = () => {
    const searchBrandList = [];
    const data = [];
    const {
      brandList,
      searchText
    } = this.state;
    if (searchText === undefined || searchText === '') {
      return [];
    }
    brandList.forEach((brand) => {
      const enInclude = (brand.en_name && brand.en_name.toUpperCase().includes(searchText.replace(' ', '').toUpperCase()));
      const zhInclude = (brand.name && brand.name.toUpperCase().includes(searchText.replace(' ', '').toUpperCase()));
      const pinyinInclude = (brand.pinyin && brand.pinyin.toUpperCase().includes(searchText.replace(' ', '').toUpperCase()));

      if (LHAcpartner.isChina) {
        if (zhInclude || pinyinInclude) {
          searchBrandList.push(brand);
        }
      } else if (enInclude) {
        searchBrandList.push(brand);
      }
    });
    if (searchBrandList.length === 0) {
      return [];
    }
    for (let index = 0; index < searchBrandList.length; index += 1) {
      data.push({
        hideTopSeparatorLine: index === 0,
        title: this.getTitle(LHAcpartner.isChina ? searchBrandList[index].name : searchBrandList[index].en_name),
        hideRightArrow: true,
        swipeoutClose: true,
        press: () => {
          this.onSelect(searchBrandList[index].id);
        }
      });
    }
    return [{ title: LHLocalizedStrings.mi_acpartner_search_result, data }];
  };

  onSelect = (brandId) => {
    this.setState({ searchText: '' });
    const {
      autoCloseWhenSelected,
      onSelected
    } = this.state;
    if (autoCloseWhenSelected) this.close();
    onSelected(brandId);
  };

  render() {
    const {
      show,
      searchText,
      onBack
    } = this.state;
    const brandListView = this.getBrandListView();
    return (
      show
        ? (
          <View style={{
            flex: 1
          }}
          >
            <View style={{
              height: LHDeviceUtils.statusBarHeight,
              backgroundColor: PluginConfig.TransparentColor
            }}
            />
            <View style={{
              flex: 1,
              backgroundColor: searchText === '' ? PluginConfig.DialogBgColor : LHUiUtils.MiJiaBackgroundGray
            }}
            >

              <View style={styles.searchContainer}>
                <View style={styles.searchContentView}>
                  <LHImageButton
                    source={LHCommonIcon.navigation.back.normal}
                    highlightedSource={LHCommonIcon.navigation.back.press}
                    style={styles.backButton}
                    onPress={() => {
                      this.setState({ searchText: '' });
                      onBack();
                    }}
                  />

                  <TextInput
                    autoFocus
                    selectionColor={PluginConfig.MainColor}
                    underlineColorAndroid="transparent"
                    placeholder={LHLocalizedStrings.mi_acpartner_please_input_brandname}
                    style={styles.input}
                    onChangeText={(text) => {
                      this.setState({ searchText: text });
                    }}
                  />
                </View>
              </View>
              <LHSeparator />
              { brandListView}
            </View>
          </View>
        ) : null
    );
  }

  getBrandListView() {
    const {
      searchText,
      onBack
    } = this.state;
    const pageData = this.getPageData();
    const searchEmpty = (searchText === undefined || searchText === '');
    console.log('searchText>>' + searchText);
    return (searchEmpty
      ? (
        <TouchableOpacity
          style={{
            height: '100%'
          }}
          onPress={() => {
            if (searchText === '') {
              onBack();
            }
          }}
        />
      )
      : (
        <LHStandardList
          data={pageData}
          ListEmptyComponent={
            searchEmpty
              ? null : (
                <LHStandardEmpty
                  emptyIconStyle={{
                    width: LHUiUtils.GetPx(138),
                    height: LHUiUtils.GetPx(138),
                    marginTop: LHUiUtils.GetPx(146)
                  }}
                  emptyPageStyle={{ backgroundColor: LHUiUtils.MiJiaBackgroundGray }}
                  emptyTextStyle={{ marginTop: LHUiUtils.GetPx(-5) }}
                  emptyIcon={Resource.MatchImage.brandSearchEmptyIcon}
                  text={LHLocalizedStrings.mi_acpartner_no_result}
                />
              )}
        />
      ));
  }
}
