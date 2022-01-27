import 'babel-polyfill';
import { EVENT_KEY } from '../../libs/config/const';
import { proxySwitch, getUrlProxyInfo, updateProxy, deleteProxy } from './devtool';
import { chromeAddListenerMessage, sendMessageToContentScript } from '../../libs/chrome';
let devToolPort: chrome.runtime.Port | undefined;
chromeAddListenerMessage(async (message) => {
  if (message.from !== 'content_script') return;
  switch (message.key) {
    case EVENT_KEY.API_PROXY_INJECT_INIT: {
      let path = new URL(message.data.url);
      const proxy = await getUrlProxyInfo(path.hostname, true);
      if (proxy) await noticeApiPrxoxyUpdata(proxy.webSite, proxy.apiProxy);
      break;
    }
    case EVENT_KEY.API_PROXY_INJECT_UPDATA: {
      await updateProxy(message);
      let path = new URL(message.data.url);
      const proxy = await getUrlProxyInfo(path.hostname, true);
      if (proxy) await noticeApiPrxoxyUpdata(proxy.webSite, proxy.apiProxy);
      break;
    }
    default:
  }
});
chrome.runtime.onConnect.addListener(function (port) {
  const extensionListener = async (message: PostMessage, port: chrome.runtime.Port) => {
    console.log('devtool连接');
    devToolPort = port;
    if (message.from != 'devtools') return;
    switch (message.key) {
      case EVENT_KEY.API_PROXY_DEVTOOL_WEBSITE_UPDATA: {
        const proxy = await proxySwitch(message);
        if (proxy) await noticeApiPrxoxyUpdata(proxy.webSite, proxy.apiProxy);
        break;
      }
      case EVENT_KEY.API_PROXY_DEVTOOL_INIT: {
        let path = new URL(message.data.url);
        const proxy = await getUrlProxyInfo(path.hostname);
        if (proxy) await noticeApiPrxoxyUpdata(proxy.webSite, proxy.apiProxy);
        break;
      }
      case EVENT_KEY.API_PROXY_DEVTOOL_API_UPDATA: {
        await updateProxy(message);
        const proxy = await getUrlProxyInfo(message.data.webSite.url);
        if (proxy) await noticeApiPrxoxyUpdata(proxy.webSite, proxy.apiProxy);
        break;
      }
      case EVENT_KEY.API_PROXY_DEVTOOL_DELETE: {
        await deleteProxy(message.data.id);
        const proxy = await getUrlProxyInfo(message.data.url);
        if (proxy) await noticeApiPrxoxyUpdata(proxy.webSite, proxy.apiProxy);
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
function noticeApiPrxoxyUpdata(webSite: WebSite, apiProxy: ApiProxy[]) {
  let message = {
    from: 'background',
    key: EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
    data: {
      webSite,
      apiProxy,
    },
  };
  sendMessageToContentScript(message);
  if (devToolPort) {
    devToolPort.postMessage(message);
  } else {
    console.log('devtool已经掉线');
  }
}
