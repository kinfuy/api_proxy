/**
 * 获取插件相对地址
 * @param path
 * @returns
 */
export const getChromeUrl = (path: string) => {
  return chrome.runtime.getURL(path);
};

/**
 * 向平台注入动态js
 * @param jsPath
 * @returns
 */
export const injectCustomJs = (jsPath?: string) => {
  jsPath = jsPath || 'libs/script/inject.js';
  let temp = document.createElement('script');
  if (!temp) return new Error('发生了错误');
  temp.setAttribute('type', 'text/javascript');
  temp.src = getChromeUrl(jsPath);
  temp.onload = function () {
    if (temp.parentNode) {
      temp.parentNode.removeChild(temp);
    } else {
      document.removeChild(temp);
    }
  };
  document.head.appendChild(temp);
};
