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
        console.log(`[ApiProxy]: 拦截到: ${method}  ${url}`);
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
          console.log('[ApiProxy]: xml请求参数已被apiProxy代理');
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
        if (this.apiProxy.proxyContent.response.data && this.apiProxy.proxyContent.response.isOriginCatch !== true) {
          this.apiProxy.proxyContent.response.isOriginCatch = false;
          let self_response = await beforeXmlResponse(this.apiProxy.proxyContent);
          console.log('[ApiProxy]: xml响应参数已被apiProxy代理');
          Object.defineProperty(this, 'response', {
            value: self_response,

            configurable: true,
          });
          Object.defineProperty(this, 'responseText', {
            value: self_response,
            configurable: true,
          });
          console.log('🔥log=>xmlProxy=>74:response:%o', this.response);
        } else {
          this.addEventListener('readystatechange', () => {
            if (this.readyState === 4) {
              if (this.apiProxy) {
                this.apiProxy.proxyContent.response.data = cloneDeep(this.response);
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
