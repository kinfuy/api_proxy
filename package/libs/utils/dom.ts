/**
 * 监听事件
 * @param target 目标元素
 * @param eventType 事件类型
 * @param cb 回调函数
 * @param option
 * @returns
 */
export const addEventListener = (
  target: HTMLElement | Document | Window,
  eventType: string,
  cb: EventListenerOrEventListenerObject,
  option?: boolean | AddEventListenerOptions
): addEventListenerReturn => {
  if (target.addEventListener) {
    target.addEventListener(eventType, cb, option);
  }
  return {
    remove: () => {
      if (target.removeEventListener) {
        target.removeEventListener(eventType, cb);
      }
    },
  };
};

/**
 * 广播消息
 * @param EventMessage 数据
 * @param url 目标地址 默认'*'
 */
export const windowPostMessage = (EventMessage: PostMessage, url = '*') => {
  window.postMessage(EventMessage, url);
};

/**
 * url参数提取
 * @returns
 */
export const getQueryString = (url: string) => {
  // 定义返回结果
  if (url.lastIndexOf('?') !== -1) {
    return url.slice(url.lastIndexOf('?') + 1);
  }
};
