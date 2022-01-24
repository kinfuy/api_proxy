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

/**
 * 创建devtool
 */
export const createDevtoolsanels = () => {
  try {
    chrome.devtools.panels.create('ApiProxy', '/libs/assets/icon.png', '/libs/views/devtoolView.html', function (panel) {
      console.log(panel);
    });
  } catch (error) {
    console.log(error);
  }
};
/**
 * 获取store
 */
export const getStoreKey = <T>(keys: Array<string>): Promise<T> => {
  return new Promise((resolve, reject) => {
    let store: Record<string, any> = {};
    keys.forEach((x) => {
      store[x] = null;
    });
    try {
      chrome.storage.local.get(store, (rst) => {
        resolve(rst as T);
      });
    } catch (error) {
      reject(error);
    }
  });
};
/**
 * 设置store
 */
export const setStore = (store: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(store, () => {
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
};
/**
 * 清理插件所有store
 */
export const clearStore = (): void => {
  chrome.storage.local.clear();
};
/**
 * 插件消息传递
 * @param message
 * @param callback
 */
export const sendMessageToContentScript = (message: PostMessage) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        try {
          chrome.tabs.sendMessage(Number(tabs[0].id), message).then((response) => {
            resolve(response);
          });
        } catch (error) {
          console.log('当前没有活跃的tabs');
        }
      } else {
        console.log('当前没有活跃的tabs');
      }
    });
  });
};
/**
 * 谷歌监听消息
 * @param callback
 */
export const chromeAddListenerMessage = (callback: (request: PostMessage) => void) => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse();
    callback(request);
    return false;
  });
};
/**
 * 发送消息给插件
 * @param key
 * @param data
 */
export const sendMessageToExtension = (key: string, data: any) => {
  chrome.runtime.sendMessage({
    key,
    data,
  });
};
/**
 * 创建鼠标右键
 * @param title
 * @param handler
 */
export const createContextMenus = (title: string, handler: (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void) => {
  chrome.contextMenus.create({
    title: title,
    onclick: handler,
  });
};
/**
 * 创建通知
 * @param notificationId
 * @param options "basic", "image", "list", or "progress"
 * @returns
 */
export const createNotifications = (notificationId: string, options: chrome.notifications.NotificationOptions): Promise<void> => {
  return new Promise((reslove, reject) => {
    try {
      chrome.notifications.create(notificationId, options, () => {
        reslove();
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * devtool,在宿主环境执行script
 * @param script
 * @returns
 */
export const devToolInjectScriptResult = (script: string) => {
  return new Promise((reslove, reject) => {
    try {
      chrome.devtools.inspectedWindow.eval(script, {}, (res) => {
        reslove(res);
      });
    } catch (error) {
      console.log(error);
    }
  });
};
