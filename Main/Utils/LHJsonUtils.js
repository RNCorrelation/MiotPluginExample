export default class LHJsonUtils {
  /**
   * 比较两个数组是否相等,忽略顺序。
   * @param a
   * @param b
   * @returns {boolean}
   */
  static equalArray(a, b) {
    if (a && b && a instanceof Array && b instanceof Array) {
      if (a.length !== b.length) {
        return false;
      } else {
        a.sort();
        b.sort();
        for (let i = 0; i < a.length; i += 1) {
          if (a[i] !== b[i]) {
            return false;
          }
        }
        return true;
      }
    }
    return a === b;
  }

  /**
   * 场景数据比较特殊，重新解析一次。
   * @param sceneArr
   * @returns {Array}
   */
  static parseJson(sceneArr) {
    const data = [];
    if (sceneArr && sceneArr.length > 0) {
      sceneArr.forEach((scene) => {
        const {
          authorizedDeviceIDs, createTime, deviceID, identify, isArtificial, isAutomatic, isNew, isTimer, name, sceneID, setting, status, type
        } = scene;
        const json = {
          authorizedDeviceIDs, createTime, deviceID, identify, isArtificial, isAutomatic, isNew, isTimer, name, sceneID, setting, status, type
        };
        data.push(json);
      });
    }
    return data;
  }
}