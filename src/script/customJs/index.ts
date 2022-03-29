// import 'babel-polyfill';
import { initFetchProxy, initXMLHttpRequest } from './../../libs/plugin/proxy';
import { addEventListener, IsurlMatch } from '../../libs/utils';
import { EVENT_KEY } from '../../libs/config/const';
const originXMLHttpRequest = window.XMLHttpRequest;
const originFetch = window.fetch;

const createHooks = (webSite: WebSite, apiProxy: ApiProxy[]) => {
  const beforeXmlOpen = (method: string, url: string | URL) => {
    return { method, url };
  };
  const beforeXmlRequest = (proxyContent: ProxyContent, body?: Document | XMLHttpRequestBodyInit | null) => {
    return proxyContent.request.data;
  };
  const beforeXmlResponse = (proxyContent: ProxyContent) => {
    return proxyContent.response.data;
  };

  return {
    beforeXmlOpen,
    beforeXmlRequest,
    beforeXmlResponse,
  };
};
const initProxy = (
  webSite: WebSite,
  apiProxy: ApiProxy[],
  beforeXmlOpen: (method: string, url: string | URL) => { method: string; url: string | URL },
  beforeXmlRequest: (
    proxyContent: ProxyContent,
    body?: Document | XMLHttpRequestBodyInit | null | undefined
  ) => Document | XMLHttpRequestBodyInit | null | undefined,
  beforeXmlResponse: (proxyContent: ProxyContent) => any
) => {
  if (webSite.isProxy) {
    const SELF_XML_HTTP_REQUEST = initXMLHttpRequest(originXMLHttpRequest, apiProxy, beforeXmlOpen, beforeXmlRequest, beforeXmlResponse);
    const SELF_FETCH = initFetchProxy(originFetch, apiProxy);
    window.XMLHttpRequest = SELF_XML_HTTP_REQUEST;
    window.fetch = SELF_FETCH;
  } else {
    window.XMLHttpRequest = originXMLHttpRequest;
    window.fetch = originFetch;
  }
};
addEventListener(window, 'message', (info: any) => {
  const message = info.data as PostMessage;
  if (message.from !== 'content_script') return;
  switch (message.key) {
    case EVENT_KEY.API_PROXY_BACKGROUND_UPDATE: {
      console.log('[ApiProxy]: 已重载');
      // 监听到背景页通知需要更新代理信息
      // 重新初始化xml fetch
      const { beforeXmlOpen, beforeXmlRequest, beforeXmlResponse } = createHooks(message.data.webSite, message.data.apiProxy);
      initProxy(message.data.webSite, message.data.apiProxy, beforeXmlOpen, beforeXmlRequest, beforeXmlResponse);
      break;
    }
    case EVENT_KEY.API_PROXY_INJECT_INIT: {
      console.log('[ApiProxy]: 已重载');
      // 监听到背景页通知需要更新代理信息
      // 重新初始化xml fetch
      const { beforeXmlOpen, beforeXmlRequest, beforeXmlResponse } = createHooks(message.data.webSite, message.data.apiProxy);
      initProxy(message.data.webSite, message.data.apiProxy, beforeXmlOpen, beforeXmlRequest, beforeXmlResponse);
      break;
    }
    default:
      break;
  }
});
