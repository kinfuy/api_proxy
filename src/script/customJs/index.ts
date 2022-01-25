import { initFetchProxy, initXMLHttpRequest } from './../../libs/plugin/proxy';
import { addEventListener } from '../../libs/utils';
import { EVENT_KEY } from '../../libs/config/const';
const originXMLHttpRequest = window.XMLHttpRequest;

const createHooks = () => {
  const beforeXmlOpen = (method: string, url: string | URL) => {
    console.log('open前钩子');
    console.log(method, url);
    return {
      method,
      url,
    };
  };
  const beforeXmlRequest = (options: { url: URL | string; method: string }, body?: Document | XMLHttpRequestBodyInit | null) => {
    console.log('请求前钩子');
    console.log(options);
    console.log(body);
    return body;
  };
  const beforeXmlResponse = <T>(response: T) => {
    console.log('响应前钩子');
    console.log(response);
    return response;
  };

  return {
    beforeXmlOpen,
    beforeXmlRequest,
    beforeXmlResponse,
  };
};
const initProxy = (
  isProxy: boolean,
  beforeXmlOpen: (method: string, url: string | URL) => { method: string; url: string | URL },
  beforeXmlRequest: (
    options: { url: URL | string; method: string },
    body?: Document | XMLHttpRequestBodyInit | null | undefined
  ) => Document | XMLHttpRequestBodyInit | null | undefined,
  beforeXmlResponse: <T>(response: T) => T
) => {
  if (isProxy) {
    const SELF_XML_HTTP_REQUEST = initXMLHttpRequest(beforeXmlOpen, beforeXmlRequest, beforeXmlResponse);
    window.XMLHttpRequest = SELF_XML_HTTP_REQUEST;
  } else {
    window.XMLHttpRequest = originXMLHttpRequest;
  }
};
addEventListener(window, 'message', (info: any) => {
  const message = info.data as PostMessage;
  if (message.from === 'content_script') {
    if (message.key === EVENT_KEY.API_PROXY_WEBSITE_SWITCH) {
      const { beforeXmlOpen, beforeXmlRequest, beforeXmlResponse } = createHooks();
      initProxy(message.data.webSite.isProxy, beforeXmlOpen, beforeXmlRequest, beforeXmlResponse);
    }
  }
});
