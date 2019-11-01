import { Package, PackageEvent } from 'miot';
import { LHDebugConfig } from 'LHCommonFunction';
import App from './Main/index';

LHDebugConfig.OffDebug();
PackageEvent.packageAuthorizationCancel.addListener(() => {
  Package.exit();
});
Package.entry(App);
