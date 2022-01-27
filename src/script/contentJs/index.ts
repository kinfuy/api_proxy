import 'babel-polyfill';
import { injectCustomJs, getChromeUrl, sendMessageToExtension, chromeAddListenerMessage } from '../../libs/chrome';
import { EVENT_KEY } from '../../libs/config/const';
import { addEventListener } from '../../libs/utils';
const prefix = 'api_proxy';

//谷歌监听消息
chromeAddListenerMessage((message: PostMessage) => {
  if (message.from === 'background') {
    if (message.key === EVENT_KEY.API_PROXY_WEBSITE_UPDATE) {
      window.postMessage(
        {
          from: 'content_script',
          key: EVENT_KEY.API_PROXY_WEBSITE_UPDATE,
          data: message.data,
        },
        '*'
      );
    }
  }
});
addEventListener(window, 'message', (info: any) => {
  const message = info.data as PostMessage;
  if (message.from === 'inject_script') {
    switch (message.key) {
      case EVENT_KEY.API_PROXY_APIPROXY_UPDATE: {
        sendMessageToExtension({
          from: 'content_script',
          key: EVENT_KEY.API_PROXY_APIPROXY_UPDATE,
          data: { apiProxy: message.data.apiProxy, url: window.location.href },
        });
        break;
      }
      default:
        break;
    }
  }
});
document.onreadystatechange = async function () {
  if (document.readyState === 'interactive') {
    await injectCustomJs('libs/script/customJs.js');
    console.log(getChromeUrl('/libs/script/devtoolView.html'));
  }
  if (document.readyState === 'complete') {
    await sendMessageToExtension({
      from: 'content_script',
      key: EVENT_KEY.API_PROXY_INIT,
      data: { url: window.location.href },
    });
  }
};
