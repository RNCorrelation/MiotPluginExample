import Resources from 'Resources';
import LHArtificialMatchingDonePage from './LHArtificialMatchingDonePage';
import LHLocalizedString from '../../Localized/LHLocalizableString';


export default class LHArtificialMatchingSuccessPage extends LHArtificialMatchingDonePage {
  constructor(props) {
    super(props);
    this.state.title = LHLocalizedString.mi_acpartner_artificial_matching_submit_success;
    this.state.uploadProcess = Resources.MatchImage.uploadProcessC;
    this.state.gesturesEnabled = false;
  }

  componentWillMount() {
    super.componentWillMount();
    this.setState({
      bottomBtText: LHLocalizedString.mi_acpartner_artificial_matching_i_know
    });
  }

  onBackPressed = () => {
    const { navigation } = this.props;
    const { routes } = navigation.dangerouslyGetParent().state;
    if (routes) {
      const routeNames = [];
      routes.forEach((route) => {
        routeNames.push(route.routeName);
      });
      console.log('routeNames ', routeNames);
      const fromSetting = routeNames.indexOf('LHSettingPage');
      if (fromSetting > -1) {
        navigation.navigate('LHSettingPage');
      } else {
        navigation.navigate('LHMainPage');
      }
    } else {
      navigation.goBack();
    }
  };

  bottomBtClick = () => {
    this.onBackPressed();
  };
}