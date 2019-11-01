export default class LHSpecHost {
  /**
   * 进入匹配模式
   */
   enterMatch=() => {
     throw new Error('');
   };

   /**
   * 退出匹配模式
   */
   exitMatch=() => {
     throw new Error('');
   };

   /**
   * 更新空调匹配状态
   */
   setAcModel=(brandId, controllerId, acStatus) => {
     throw new Error('');
   };

  /**
   * 开关指示灯 获取状态，返回：0-开，1-关。
   */
  getPropEnNnlight=() => {
    throw new Error('');
  };

  /**
   * 开关指示灯 设置状态。
   */
  setPropEnNnlight=(value) => {
    throw new Error('');
  }
}