import {
  chromeAddListenerMessage,
  injectCustomJs,
  sendMessageToExtension,
} from '../libs/chrome';
import { EVENT_KEY } from '../libs/config/const';
import { addEventListener, windowPostMessage } from '../libs/utils';

const timer = setInterval(() => {
  try {
    injectCustomJs('script/custom.js').then(() => {
      clearInterval(timer);
    });
  } catch (error) {
    console.log(error);
  }
}, 10);

//谷歌监听消息
chromeAddListenerMessage((message: PostMessage) => {
  if (message.from !== 'background') return; //只接收来着background的信息
  switch (message.key) {
    case EVENT_KEY.API_PROXY_BACKGROUND_UPDATE: {
      windowPostMessage({
        from: 'content_script',
        key: EVENT_KEY.API_PROXY_BACKGROUND_UPDATE,
        data: message.data,
      });
      break;
    }
    case EVENT_KEY.API_PROXY_INJECT_INIT: {
      windowPostMessage({
        from: 'content_script',
        key: EVENT_KEY.API_PROXY_INJECT_INIT,
        data: message.data,
      });
      break;
    }
    default:
      break;
  }
});
addEventListener(window, 'message', (info: any) => {
  const message = info.data as PostMessage;
  if (message.from !== 'inject_script') return; //只接收来着inject_script的信息
  switch (message.key) {
    case EVENT_KEY.API_PROXY_INJECT_UPDATA: {
      sendMessageToExtension({
        from: 'content_script',
        key: EVENT_KEY.API_PROXY_INJECT_UPDATA,
        data: { apiProxy: message.data.apiProxy, url: message.data.url },
      });
      break;
    }
    default:
      break;
  }
});

document.onreadystatechange = async function () {
  if (document.readyState === 'complete') {
    sendMessageToExtension({
      from: 'content_script',
      key: EVENT_KEY.API_PROXY_INJECT_INIT,
      data: { url: window.location.href },
    });
  }
};
