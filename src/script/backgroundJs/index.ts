import 'babel-polyfill';
import { EVENT_KEY } from '../../libs/config/const';
import { proxySwitch, devToolInit } from './devtool';
import { chromeAddListenerMessage, sendMessageToContentScript } from '../../libs/chrome';

chromeAddListenerMessage(async (message) => {
  if (message.from === 'content_script') {
    if (message.key === EVENT_KEY.API_PROXY_OPEN) {
    }
  }
});
chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = (message: PostMessage, port: chrome.runtime.Port) => {
    if (message.from == 'devtools') {
      switch (message.key) {
        case EVENT_KEY.API_PROXY_WEBSITE_SWITCH: {
          proxySwitch(message).then((res) => {
            if (res) {
              sendMessageToContentScript({
                from: 'background',
                key: EVENT_KEY.API_PROXY_WEBSITE_SWITCH,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
              port.postMessage({
                from: 'background',
                key: EVENT_KEY.API_PROXY_WEBSITE_SWITCH,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
            }
          });
          break;
        }
        case EVENT_KEY.API_PROXY_DEVTOOL_INIT: {
          devToolInit(message).then((res) => {
            if (res) {
              port.postMessage({
                from: 'background',
                key: EVENT_KEY.API_PROXY_DEVTOOL_INIT,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
            }
          });
          break;
        }

        default:
          break;
      }
    }
  };
  port.onMessage.addListener(extensionListener);
  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);
  });
});
