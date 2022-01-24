interface WebSite {
  id: string;
  url: string;
  storeKey: string;
  isProxy: boolean;
}
interface ProxyContent {
  requestData: any;
  requestHeader: any;
  responseData: any;
  responseHeader: any;
}
interface ApiProxy {
  id: string;
  name: string;
  url: string;
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
