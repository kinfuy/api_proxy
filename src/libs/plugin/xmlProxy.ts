import cloneDeep from 'lodash.clonedeep';
import { EventKey } from '../config/const';
import { IsurlMatch, windowPostMessage } from '../utils';

export const initXMLHttpRequest = (
  originXmlHttpRequest: typeof window.XMLHttpRequest,
  apiProxy: ApiProxy[],
  beforeXmlOpen: (method: string, url: string | URL) => { method: string; url: string | URL },
  beforeXmlRequest: (
    proxyContent: ProxyContent,
    body?: Document | XMLHttpRequestBodyInit | null | undefined
  ) => Document | XMLHttpRequestBodyInit | null | undefined,
  beforeXmlResponse: (proxyContent: ProxyContent) => any
) => {
  class Self_XmlHttpRequest extends originXmlHttpRequest {
    isProxySend = true;
    proxyUrl: string | URL = '';
    proxyMethod = '';
    apiProxy: undefined | ApiProxy = undefined; // 需要拦截的api
    isMock = false;
    // 自定义属性
    constructor() {
      super();
    }
    sendMessageToContent(key: EventKey, data: any) {
      const message: PostMessage = { from: 'inject_script', key, data };
      windowPostMessage(message);
    }
    async open(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      if (apiProxy.some((x) => x.method === method && IsurlMatch(url.toString(), [x.url]))) {
        apiProxy.forEach((x) => {
          if (x.method === method && IsurlMatch(url.toString(), [x.url])) {
            this.apiProxy = x; // 获取代理信息
          }
        });
        this.isMock = true;
      }
      const openQuery = beforeXmlOpen(method, url);
      this.proxyUrl = openQuery.url;
      this.proxyMethod = openQuery.method;
      await originXmlHttpRequest.prototype.open.apply(this, [openQuery.method, openQuery.url, async, username, password]);
    }
    async send(body?: Document | XMLHttpRequestBodyInit | null) {
      if (this.isMock && this.apiProxy) {
        if (this.apiProxy.proxyContent.request.data && this.apiProxy.proxyContent.request.isOriginCatch !== true) {
          this.apiProxy.proxyContent.request.isOriginCatch = false;
          const self_body = await beforeXmlRequest(this.apiProxy.proxyContent, body);
          await originXmlHttpRequest.prototype.send.call(this, self_body);
        } else {
          this.apiProxy.proxyContent.request.isOriginCatch = true;
          this.apiProxy.proxyContent.request.data = body;
          this.sendMessageToContent('API_PROXY_INJECT_UPDATA', {
            url: window.location.href,
            apiProxy: cloneDeep(this.apiProxy),
          });
          await originXmlHttpRequest.prototype.send.call(this, body);
        }
        if (
          this.apiProxy.proxyContent.response.data &&
          this.apiProxy.proxyContent.response.isOriginCatch !== true &&
          this.responseType === 'json'
        ) {
          this.apiProxy.proxyContent.response.isOriginCatch = false;
          let self_response = await beforeXmlResponse(this.apiProxy.proxyContent);
          self_response = JSON.parse(self_response);
          Object.defineProperty(this, 'response', {
            get: () => self_response,
            configurable: true,
          });
        } else {
          this.addEventListener('readystatechange', () => {
            if (this.readyState === 4) {
              if (this.apiProxy && this.responseType === 'json') {
                this.apiProxy.proxyContent.response.data = JSON.stringify(this.response);
                this.apiProxy.proxyContent.response.isOriginCatch = true;
                this.sendMessageToContent('API_PROXY_INJECT_UPDATA', {
                  url: window.location.href,
                  apiProxy: cloneDeep(this.apiProxy),
                });
              }
            }
          });
        }
      } else {
        await originXmlHttpRequest.prototype.send.call(this, body);
      }
    }
  }
  return Self_XmlHttpRequest;
};
