const originXmlHttpRequest = window.XMLHttpRequest;
export const initXMLHttpRequest = (
  beforeXmlOpen: (method: string, url: string | URL) => { method: string; url: string | URL },
  beforeXmlRequest: (
    options: { url: URL | string; method: string },
    body?: Document | XMLHttpRequestBodyInit | null | undefined
  ) => Document | XMLHttpRequestBodyInit | null | undefined,
  beforeXmlResponse: <T>(response: T) => T
) => {
  class Self_XmlHttpRequest extends XMLHttpRequest {
    isProxySend = true;
    proxyUrl: string | URL = '';
    proxyMethod = '';
    constructor() {
      super();
      this.addEventListener('readystatechange', async () => {
        if (this.readyState === 4) {
          const self_response = await beforeXmlResponse(this.response);
          Object.defineProperty(this, 'response', {
            get: () => self_response,
          });
        }
      });
    }
    async open(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      const openQuery = beforeXmlOpen(method, url);
      this.proxyUrl = openQuery.url;
      this.proxyMethod = openQuery.method;
      await originXmlHttpRequest.prototype.open.apply(this, [openQuery.method, openQuery.url, async, username, password]);
    }
    async send(body?: Document | XMLHttpRequestBodyInit | null) {
      if (this.isProxySend) {
        const self_body = await beforeXmlRequest({ url: this.proxyUrl, method: this.proxyMethod }, body);
        this.isProxySend = false;
        await originXmlHttpRequest.prototype.send.call(this, self_body);
      }
    }
  }
  return Self_XmlHttpRequest;
};
