/*
 * @Descripttion:
 * @version:
 * @Author: nicolas
 * @Date: 2019-09-06 18:04:00
 * @LastEditors: nicolas
 * @LastEditTime: 2019-09-06 18:28:32
 */
import {
  LHInitPage,
  LHSubDevicesListPage,
  LHSpecDebugPage,
  LHMoreSettingPage,
  LHCurvePage,
  LHTipsPage
} from 'LHCommonUI';
import { Entrance } from 'miot';
import Package from 'miot/Package';
import LHMainPage from './LHMainPage';
import LHIRTestPage from './Page/Test/LHIRTestPage';
import getStore from './Redux/Stores';
import LHBrandListPage from './Page/Match/LHBrandListPage';
import LHMatchRemoterPage from './Page/Match/LHMatchRemoterPage';
import LHSettingPage from './Page/Setting/LHSettingPage';
import LHIRApiTestPage from './Page/Test/LHIRApiTestPage';
import LHFileTestPage from './Page/Test/LHFileTestPage';
import LHWorkModePage from './Page/Setting/LHWorkModePage';
import ImagePickerDemo from './Page/Test/ImagePickerDemo';
import LHMatchGuidePage from './Page/Match/LHMatchGuidePage';
import LHSleepPage from './Page/Sleep/LHSleepPage';
import LHQuickCoolPage from './Page/QuickCool/LHQuickCoolPage';
import LHTimeListPage from './Page/Timer/LHTimeListPage';
import LHTimeEditPage from './Page/Timer/Edit/LHTimeEditPage';
import LHTimeWorkStatePage from './Page/Timer/Edit/LHTimeWorkStatePage';
import LHSleepTimerPage from './Page/Sleep/LHSleepTimerPage';
import LHUploadRemoteControlPage from './Page/Setting/LHUploadRemoteControlPage';
import LHSubmitInfraredCodePage from './Page/Setting/LHSubmitInfraredCodePage';
import LHArtificialMatchingSuccessPage from './Page/Setting/LHArtificialMatchingSuccessPage';
import LHArtificialMatchingDonePage from './Page/Setting/LHArtificialMatchingDonePage';
import LHCustomScenePage from './Page/ScenePage/LHCustomScenePage';

const store = getStore();
const APP = LHInitPage({
  LHMainPage,
  LHSubDevicesListPage,
  LHSpecDebugPage,
  LHMoreSettingPage,
  LHIRTestPage,
  LHBrandListPage,
  LHMatchRemoterPage,
  LHSettingPage,
  LHUploadRemoteControlPage,
  LHSubmitInfraredCodePage,
  LHArtificialMatchingSuccessPage,
  LHArtificialMatchingDonePage,
  LHIRApiTestPage,
  LHFileTestPage,
  LHWorkModePage,
  ImagePickerDemo,
  LHMatchGuidePage,
  LHSleepPage,
  LHTimeListPage,
  LHTimeEditPage,
  LHTimeWorkStatePage,
  LHCurvePage,
  LHSleepTimerPage,
  LHQuickCoolPage,
  LHCustomScenePage,
  LHTipsPage

},
Entrance.Scene === Package.entrance ? 'LHCustomScenePage' : 'LHMainPage', store);
export default APP;

// connect(mapStateToProps)(App);