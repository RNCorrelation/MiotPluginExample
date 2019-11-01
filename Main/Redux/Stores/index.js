import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';

import getReducers from '../Reducers';
// promiseMiddleware 是异步action的一个中间件，本例子中暂时没有使用
export default function getStore() {
  return createStore(
    getReducers(),
    undefined,
    applyMiddleware(promiseMiddleware)
  );
}