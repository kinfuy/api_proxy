import { EVENT_KEY } from '../../libs/config/const';
import {
  chromeAddListenerMessage,
  sendMessageToContentScript,
} from '../../libs/chrome';
import {
  deleteProxy,
  getUrlProxyInfo,
  proxySwitch,
  updateProxy,
} from './devtools';
let devToolPort: chrome.runtime.Port | undefined;
chromeAddListenerMessage(async (message) => {
  if (message.from !== 'content_script') return;
  switch (message.key) {
    case EVENT_KEY.API_PROXY_INJECT_INIT: {
      const path = new URL(message.data.url);
      const proxy = await getUrlProxyInfo(path.hostname);
      if (proxy)
        await noticeApiPrxoxyUpdata(
          EVENT_KEY.API_PROXY_INJECT_INIT,
          proxy.webSite,
          proxy.apiProxy
        );
      break;
    }
    case EVENT_KEY.API_PROXY_INJECT_UPDATA: {
      await updateProxy(message);
      const path = new URL(message.data.url);
      const proxy = await getUrlProxyInfo(path.hostname);
      if (proxy)
        await noticeApiPrxoxyUpdata(
          EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
          proxy.webSite,
          proxy.apiProxy
        );
      break;
    }
    default:
  }
});
chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = async (
    message: PostMessage,
    port: chrome.runtime.Port
  ) => {
    console.log('devtool连接');
    devToolPort = port;
    if (message.from != 'devtools') return;
    switch (message.key) {
      case EVENT_KEY.API_PROXY_DEVTOOL_WEBSITE_UPDATA: {
        const proxy = await proxySwitch(message);
        if (proxy)
          await noticeApiPrxoxyUpdata(
            EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
            proxy.webSite,
            proxy.apiProxy
          );
        break;
      }
      case EVENT_KEY.API_PROXY_DEVTOOL_INIT: {
        const path = new URL(message.data.url);
        const proxy = await getUrlProxyInfo(path.hostname);
        if (proxy)
          await noticeApiPrxoxyUpdata(
            EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
            proxy.webSite,
            proxy.apiProxy
          );
        break;
      }
      case EVENT_KEY.API_PROXY_DEVTOOL_API_UPDATA: {
        await updateProxy(message);
        const proxy = await getUrlProxyInfo(message.data.webSite.url);
        if (proxy)
          await noticeApiPrxoxyUpdata(
            EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
            proxy.webSite,
            proxy.apiProxy
          );
        break;
      }
      case EVENT_KEY.API_PROXY_DEVTOOL_DELETE: {
        await deleteProxy(message.data.id);
        const proxy = await getUrlProxyInfo(message.data.url);
        if (proxy)
          await noticeApiPrxoxyUpdata(
            EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
            proxy.webSite,
            proxy.apiProxy
          );
        break;
      }
      default:
        break;
    }
  };
  port.onMessage.addListener(extensionListener);
  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(extensionListener);
    devToolPort = undefined;
  });
});

/**
 * 通知信息更新
 * @param webSite
 * @param apiProxy
 */
function noticeApiPrxoxyUpdata(
  eventKey: string,
  webSite: WebSite,
  apiProxy: ApiProxy[]
) {
  const message = {
    from: 'background',
    key: eventKey,
    data: {
      webSite,
      apiProxy,
    },
  };
  sendMessageToContentScript(message);
  // sendMessageToExtension(message);
  if (devToolPort) {
    devToolPort.postMessage(message);
  } else {
    console.log('devtool已经掉线');
  }
}
