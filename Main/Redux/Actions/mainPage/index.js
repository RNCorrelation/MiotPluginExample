import { createAction } from 'redux-actions';
import {
  CHANGE_TEXT_TEST,
  SHOW_MORE_DIALOG
} from '../ActionTypes';

// 同步action
const changeText = createAction(CHANGE_TEXT_TEST, (text) => {
  return text;
});

// 异步action方式1，推荐使用这种方式
const changeText2 = createAction(CHANGE_TEXT_TEST, (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(text);
    }, 5000);
  });
});


// 异步action,错误调用
const changeText3 = createAction(CHANGE_TEXT_TEST, (text) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(text);
    }, 5000);
  });
});

const showMoreDialog = createAction(SHOW_MORE_DIALOG, (isShow) => {
  return isShow;
});
const mainPageActions = {
  changeText,
  changeText2,
  changeText3,
  showMoreDialog
};
export default mainPageActions;