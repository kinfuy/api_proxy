import 'babel-polyfill';
import { EVENT_KEY } from '../../libs/config/const';
import { proxySwitch, getUrlProxyInfo, updateProxy, deleteProxy } from './devtool';
import { chromeAddListenerMessage, sendMessageToContentScript } from '../../libs/chrome';
let devToolPort: chrome.runtime.Port | undefined;
chromeAddListenerMessage(async (message) => {
  if (message.from === 'content_script') {
    if (message.key === EVENT_KEY.API_PROXY_INIT) {
      let path = new URL(message.data.url);
      getUrlProxyInfo(path.hostname, true).then((res) => {
        if (res) {
          sendMessageToContentScript({
            from: 'background',
            key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
            data: {
              webSite: res.webSite,
              apiProxy: res.apiProxy,
            },
          });
        }
      });
    }
    if (message.key === EVENT_KEY.API_PROXY_APIPROXY_UPDATE) {
      console.log('🔥log=>index=>24:message:%o', message);
      updateProxy(message).then(() => {
        let path = new URL(message.data.url);
        getUrlProxyInfo(path.hostname, true).then((res) => {
          if (res) {
            sendMessageToContentScript({
              from: 'background',
              key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
              data: {
                webSite: res.webSite,
                apiProxy: res.apiProxy,
              },
            });
            if (devToolPort) {
              devToolPort.postMessage({
                from: 'background',
                key: EVENT_KEY.API_PROXY_DEVTOOL_INIT,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
            }
          }
        });
      });
    }
    if (message.key === EVENT_KEY.API_PROXY_APIPROXY_DELETE) {
      deleteProxy(message.data.id).then(() => {
        let path = new URL(message.data.url);
        getUrlProxyInfo(path.hostname, true).then((res) => {
          if (res) {
            sendMessageToContentScript({
              from: 'background',
              key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
              data: {
                webSite: res.webSite,
                apiProxy: res.apiProxy,
              },
            });
            if (devToolPort) {
              devToolPort.postMessage({
                from: 'background',
                key: EVENT_KEY.API_PROXY_DEVTOOL_INIT,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
            }
          }
        });
      });
    }
  }
});
chrome.runtime.onConnect.addListener(function (port) {
  devToolPort = port;
  const extensionListener = (message: PostMessage, port: chrome.runtime.Port) => {
    if (message.from == 'devtools') {
      switch (message.key) {
        case EVENT_KEY.API_PROXY_WEBSITE_UPDATE: {
          proxySwitch(message).then((res) => {
            if (res) {
              sendMessageToContentScript({
                from: 'background',
                key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
              port.postMessage({
                from: 'background',
                key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
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
          let path = new URL(message.data.url);
          getUrlProxyInfo(path.hostname).then((res) => {
            if (res) {
              sendMessageToContentScript({
                from: 'background',
                key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
                data: {
                  webSite: res.webSite,
                  apiProxy: res.apiProxy,
                },
              });
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
        case EVENT_KEY.API_PROXY_APIPROXY_UPDATE: {
          updateProxy(message).then(() => {
            getUrlProxyInfo(message.data.webSite.url, true).then((res) => {
              if (res) {
                sendMessageToContentScript({
                  from: 'background',
                  key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
                  data: {
                    webSite: res.webSite,
                    apiProxy: res.apiProxy,
                  },
                });
              }
            });
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
    devToolPort = undefined;
    port.onMessage.removeListener(extensionListener);
  });
});
