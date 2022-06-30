interface WebSite {
  id: string;
  url: string;
  storeKey: string;
  isProxy: boolean;
}
interface ProxyContent {
  request: {
    isOriginCatch: boolean;
    showJson: boolean;
    showMock: boolean;
    data: any;
    header: any;
  };
  response: {
    isOriginCatch: boolean;
    showJson: boolean;
    showMock: boolean;
    data: any;
    header: any;
  };
}
interface ApiProxy {
  id: string;
  name: string;
  url: string;
  isEdit: boolean;
  isProxy: boolean;
  method: 'GET' | 'POST';
  proxyContent: ProxyContent;
}
type WebSiteStore = WebSite[];
type ApiProxyStore = ApiProxy[];
interface Api_Proxy_Store extends Record<string | symbol, any> {
  webSiteStore: WebSiteStore;
  apiProxyStore: ApiProxyStore;
}
