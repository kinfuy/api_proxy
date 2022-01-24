import 'babel-polyfill';
import { injectCustomJs, getChromeUrl, chromeAddListenerMessage } from '../../libs/chrome';
import { EVENT_KEY } from '../../libs/config/const';
import { addEventListener } from '../../libs/utils';
const prefix = 'api_proxy';

//谷歌监听消息
chromeAddListenerMessage((message: PostMessage) => {
  if (message.from === 'background') {
    if (message.key === EVENT_KEY.API_PROXY_WEBSITE_SWITCH) {
      window.postMessage(
        {
          from: 'content_script',
          key: EVENT_KEY.API_PROXY_WEBSITE_SWITCH,
          data: message.data,
        },
        '*'
      );
    }
  }
});
document.onreadystatechange = async function () {
  if (document.readyState === 'interactive') {
    injectCustomJs('libs/script/customJs.js');
  }
};
