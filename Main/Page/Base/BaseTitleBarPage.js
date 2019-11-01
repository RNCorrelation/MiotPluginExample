import React from 'react';
import { BackHandler, View } from 'react-native';
import { LHCommonStyles, LHTitleBarCustom } from 'LHCommonUI';

export default class BaseTitleBarPage extends React.Component {
  static navigationOptions = () => {
    return {
      header: null
    };
  };

  /**
   * 子类重写该函数时必须调用super.componentDidMount();
   */
  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.onBackPressed();
      return true;
    });
  }

  /**
   * 子类重写该函数时必须调用super.componentWillUnmount();
   */
  componentWillUnmount() {
    if (this.backHandler) {
      this.backHandler.remove();
    }
  }

  onBackPressed = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  /**
   * 子类返回不包括titlebar的视图。
   */
  getContentView = () => { return null; };

  render() {
    const {
      containerStyle,
      style,
      titleStyle,
      onPressTitle,
      title,
      subTitle,
      subTitleStyle,
      showDot,
      showSeparator,
      leftButtons,
      rightButtons,
      pageStyle
    } = this.state;
    const contentView = this.getContentView();
    return (
      <View style={pageStyle || LHCommonStyles.pageGrayStyle}>
        <LHTitleBarCustom
          title={title}
          subTitle={subTitle}
          containerStyle={containerStyle}
          titleStyle={titleStyle}
          onPressTitle={onPressTitle}
          subTitleStyle={subTitleStyle}
          showDot={showDot}
          showSeparator={showSeparator}
          style={style || LHCommonStyles.navigatorWithBorderBotoom}
          leftButtons={leftButtons}
          rightButtons={rightButtons}
          onPressLeft={() => {
            this.onBackPressed();
          }}
        />
        {contentView}
      </View>
    );
  }
}