/*eslint-disable*/
import { LHLocalizedStrings } from 'LHCommonFunction';
import en from './Language/en';
import longest from './Language/longest';
import zhHans from './Language/zh-Hans';
const LHLocalizableString = new LHLocalizedStrings({
  en: en,
  longest: longest,
  zh: zhHans,
});
export { LHLocalizableString as default };