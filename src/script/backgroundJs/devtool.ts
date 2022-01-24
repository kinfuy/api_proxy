import { IsurlExait, UUID } from '../../libs/utils';
import { getStoreKey, setStore } from './../../libs/chrome';
/**
 * devtool初始化
 * @param url
 * @returns
 */
export const devToolInit = async (message: PostMessage) => {
  if (!message.data.url) return null;
  const path = new URL(message.data.url);
  if (path.hostname) {
    const { webSiteStore, apiProxyStore } = await getStoreKey<{ webSiteStore: WebSiteStore; apiProxyStore: ApiProxyStore }>([
      'webSiteStore',
      'apiProxyStore',
    ]);
    if (webSiteStore) {
      const webSite = webSiteStore.filter((x) => {
        return IsurlExait(path.hostname, x.url.split(','));
      });
      if (webSite.length > 0) {
        let apiProxy: ApiProxyStore = [];
        if (apiProxyStore) {
          apiProxy = apiProxyStore.filter((x) => x.name === webSite[0].storeKey);
        }
        return {
          webSite: webSite[0],
          apiProxy,
        };
      }
    }
  }
  return null;
};
/**
 * 代理切换
 * @param message
 * @returns
 */
export const proxySwitch = async (message: PostMessage) => {
  if (!message.data.url) return null;
  const path = new URL(message.data.url);
  let { webSiteStore, apiProxyStore } = await getStoreKey<{ webSiteStore: WebSiteStore; apiProxyStore: ApiProxyStore }>([
    'webSiteStore',
    'apiProxyStore',
  ]);
  if (message.data.webSite.id === '') {
    let webSite = {
      id: UUID(),
      storeKey: path.hostname,
      isProxy: message.data.webSite.isProxy,
      url: path.hostname,
    };
    if (webSiteStore) {
      webSiteStore.push(webSite);
    } else {
      webSiteStore = [webSite];
    }
    await setStore({ webSiteStore: webSiteStore });
    return {
      webSite,
      apiProxy: [],
    };
  } else {
    let webSite: undefined | WebSite = undefined;
    let apiProxy: ApiProxy[] = [];
    if (webSiteStore)
      webSiteStore.forEach(async (x) => {
        if (x.id === message.data.webSite.id) {
          x.isProxy = message.data.webSite.isProxy;
          webSite = x;
          await setStore({ webSiteStore: webSiteStore });
          if (apiProxyStore) apiProxy = apiProxyStore.filter((i) => i.name === x.storeKey);
        }
      });
    if (webSite) {
      return {
        webSite,
        apiProxy,
      };
    }
  }
  return null;
};
