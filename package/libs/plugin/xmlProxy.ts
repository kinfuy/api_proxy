export interface OpenBody {
  method: string;
  url: string | URL;
  async: boolean;
  username?: string | null;
  password?: string | null;
}
export interface GlobalProxyContext {
  openContent?: OpenBody;
  sendContent?: SendBody;
  responseContext?: ResponseBody;
}
export type ResponseBody = XMLHttpRequest['response'];

export type SendBody = Document | XMLHttpRequestBodyInit | null | undefined;

export type BeforeXmlOpen = (
  body: OpenBody,
  context: GlobalProxyContext
) => OpenBody;

export type AfterXmlOpen = (
  body: OpenBody,
  context: GlobalProxyContext
) => void;

export type BeforeXmlSend = (
  body: SendBody,
  context: GlobalProxyContext
) => SendBody;

export type AfterXmlSend = (
  body: SendBody,
  context: GlobalProxyContext
) => void;

export type BeforeXmlResponse = (context: GlobalProxyContext) => ResponseBody;

export type AfterXmlResponese = (
  body: ResponseBody,
  context: GlobalProxyContext
) => void;

export interface XMLHttpHooks {
  beforeXmlOpen?: BeforeXmlOpen;
  afterXmlOpen?: AfterXmlOpen;
  beforeXmlSend?: BeforeXmlSend;
  afterXmlSend?: AfterXmlSend;
  beforeXmlResponse?: BeforeXmlResponse;
  afterXmlResponese?: AfterXmlResponese;
}
export interface XMLHttpRequestParameter extends XMLHttpHooks {
  originXML: typeof window.XMLHttpRequest;
}

export const initXMLHttpRequest = ({
  originXML,
  beforeXmlOpen,
  afterXmlOpen,
  beforeXmlSend,
  afterXmlSend,
  beforeXmlResponse,
  afterXmlResponese,
}: XMLHttpRequestParameter) => {
  class SelfXmlHttpRequest extends originXML {
    // 自定义属性
    globalContext: GlobalProxyContext = {};
    constructor() {
      super();
    }
    open(
      method: string,
      url: string | URL,
      async = true,
      username?: string | null,
      password?: string | null
    ) {
      const originOpenBody = { method, url, async, username, password };
      this.globalContext.openContent = originOpenBody;
      const body = beforeXmlOpen
        ? beforeXmlOpen(originOpenBody, this.globalContext)
        : originOpenBody;
      originXML.prototype.open.apply(this, [
        body.method,
        body.url,
        body.async,
        body.username,
        body.password,
      ]);
      afterXmlOpen && afterXmlOpen(body, this.globalContext);
    }
    send(originBody?: Document | XMLHttpRequestBodyInit | null) {
      this.globalContext.sendContent = originBody;
      const body = beforeXmlSend
        ? beforeXmlSend(originBody, this.globalContext)
        : originBody;
      originXML.prototype.send.call(this, body);
      afterXmlSend && afterXmlSend(body, this.globalContext);

      const responseBody =
        beforeXmlResponse && beforeXmlResponse(this.globalContext);
      if (responseBody) {
        Object.defineProperty(this, 'response', {
          value: responseBody,
          configurable: true,
        });
        Object.defineProperty(this, 'responseText', {
          value: responseBody,
          configurable: true,
        });
        Object.defineProperty(this, 'status', {
          value: 200,
          configurable: true,
        });
      }
      this.addEventListener('readystatechange', () => {
        if (this.readyState === 4) {
          this.globalContext.responseContext = this.response;
          afterXmlResponese &&
            afterXmlResponese(this.response, this.globalContext);
        }
      });
    }
  }
  return SelfXmlHttpRequest;
};
