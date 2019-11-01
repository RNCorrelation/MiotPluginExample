import React from 'react';
import {
  View, FlatList, StyleSheet
} from 'react-native';
import { LHText } from 'LHCommonUI';
import {
  LHUiUtils, LHDeviceUtils, LHToastUtils
} from 'LHCommonFunction';
import PluginConfig from '../../PluginConfig';

const LetterArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

const styles = StyleSheet.create({
  containerToastStyle: {
    height: LHUiUtils.GetPx(60),
    width: LHUiUtils.GetPx(60),
    justifyContent: 'center',
    backgroundColor: PluginConfig.DialogBgColor,
    borderRadius: LHUiUtils.GetPx(30)
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
    color: 'rgba(0,0,0, 0.7)',
    flex: 340,
    textAlign: 'left',
    marginHorizontal: LHUiUtils.GetPx(8)
  }
});
export default class LHBrandLetters extends React.Component {
  static defaultProps = {
    selectLetter: 'A',
    onSelected() {

    }
  };

  constructor(props) {
    super(props);
    const { onSelected, selectLetter } = this.props;
    this.state = { selectLetter, onSelected };
  }

  componentWillMount() {
    this.gestureHandlers = {
      onStartShouldSetResponder: () => { return true; },
      onMoveShouldSetResponder: () => { return true; },
      onResponderGrant: () => {},
      onResponderMove: (evt) => {
        this.showToastByTouch(evt.nativeEvent.pageY);
      },
      onResponderRelease: (evt) => {
        this.showToastByTouch(evt.nativeEvent.pageY);
      }
    };
  }

  componentWillReceiveProps(data) {
    if (typeof data.selectLetter !== 'undefined') {
      this.setState({ selectLetter: data.selectLetter });
    }
  }

  // TODO toast 去重复显示。
  showToastByTouch=(pageY) => {
    const { ready } = this.props;
    const { selectLetter } = this.state;
    if (!ready) return;
    const letterTopHeight = LHUiUtils.TitleBarHeight + LHDeviceUtils.statusBarHeight;
    let remainCount = Math.floor((pageY - letterTopHeight - LHUiUtils.GetPx(15)) / LHUiUtils.GetPx(19, 360, 330));
    remainCount = remainCount < 0 ? 0 : remainCount;
    // remainCount = remainCount > (LetterArray.length - 1) ? LetterArray.length - 1 : remainCount;
    if (remainCount > LetterArray.length - 1) return;
    if (selectLetter !== LetterArray[remainCount]) {
      this.setState({ selectLetter: LetterArray[remainCount] });
      this.onSelect(LetterArray[remainCount]);
      LHToastUtils.showShortToast(LetterArray[remainCount], {
        textStyle: { fontSize: LHUiUtils.GetPx(18) },
        containerStyle: styles.containerToastStyle,
        animation: false,
        durationL: 1000
      });
    }
  };

  onSelect =(letter) => {
    const { onSelected } = this.state;
    onSelected(letter);
  }

  render() {
    const { ready } = this.props;
    const { selectLetter } = this.state;
    return (
      <View
        {...this.gestureHandlers}
        style={{
          width: LHUiUtils.GetPx(15),
          height: '100%'
        }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          bounces={false}
          initialNumToRender={26}
          style={{
            width: LHUiUtils.GetPx(15),
            marginTop: LHUiUtils.GetPx(15),
            height: '100%',
            opacity: ready ? 1 : 0.3
          }}
          data={LetterArray}
          renderItem={({ item }) => {
            return (
              <View style={{
                backgroundColor: LHUiUtils.MiJiaWhite,
                height: LHUiUtils.GetPx(19, 360, 330),
                justifyContent: 'center'
              }}
              >
                <LHText style={{
                  fontSize: LHUiUtils.GetPx(8),
                  color: selectLetter === item ? PluginConfig.MainColor : PluginConfig.MainTextDetailcolor,
                  alignSelf: 'center',
                  lineHeight: LHUiUtils.GetPx(19, 330, 350)
                }}
                >
                  {item}
                </LHText>
              </View>
            );
          }}
          keyExtractor={(item) => {
            return item;
          }}
        />
      </View>

    );
  }
}