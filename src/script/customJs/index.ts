import { initFetchProxy, initXMLHttpRequest } from './../../libs/plugin/proxy';
import { addEventListener, IsurlMatch } from '../../libs/utils';
import { EVENT_KEY } from '../../libs/config/const';
import cloneDeep from 'lodash.clonedeep';
const originXMLHttpRequest = window.XMLHttpRequest;

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
    window.XMLHttpRequest = SELF_XML_HTTP_REQUEST;
  } else {
    window.XMLHttpRequest = originXMLHttpRequest;
  }
};
addEventListener(window, 'message', (info: any) => {
  const message = info.data as PostMessage;
  if (message.from === 'content_script') {
    if (message.key === EVENT_KEY.API_PROXY_WEBSITE_UPDATE) {
      const { beforeXmlOpen, beforeXmlRequest, beforeXmlResponse } = createHooks(message.data.webSite, message.data.apiProxy);
      initProxy(message.data.webSite, message.data.apiProxy, beforeXmlOpen, beforeXmlRequest, beforeXmlResponse);
    }
  }
});
