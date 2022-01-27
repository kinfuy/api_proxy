import { IsurlExait, UUID } from '../../libs/utils';
import { getStoreKey, setStore } from './../../libs/chrome';
import cloneDeep from 'lodash.clonedeep';
/**
 * 获取url下代理信息
 * @param url
 * @param isEffectiveLimit 是否筛选启用的apiproxy
 * @returns
 */
export const getUrlProxyInfo = async (url: string, isEffectiveLimit: boolean = false) => {
  if (!url) return null;
  const { webSiteStore, apiProxyStore } = await getStoreKey<{ webSiteStore: WebSiteStore; apiProxyStore: ApiProxyStore }>([
    'webSiteStore',
    'apiProxyStore',
  ]);
  if (webSiteStore) {
    const webSite = webSiteStore.filter((x) => {
      return IsurlExait(url, x.url.split(','));
    });
    if (webSite.length > 0) {
      let apiProxy: ApiProxyStore = [];
      if (apiProxyStore) {
        apiProxy = apiProxyStore.filter((x) => x.name === webSite[0].storeKey && (isEffectiveLimit ? x.isProxy : true));
      }
      return {
        webSite: webSite[0],
        apiProxy,
      };
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
      webSiteStore.forEach((x) => {
        if (x.id === message.data.webSite.id) {
          x.isProxy = message.data.webSite.isProxy;
          webSite = x;
          if (apiProxyStore) apiProxy = apiProxyStore.filter((i) => i.name === x.storeKey);
        }
      });
    if (webSite) {
      await setStore({ webSiteStore: webSiteStore });
      return {
        webSite,
        apiProxy,
      };
    }
  }
  return null;
};

/**
 * 更新代理api
 * @param message
 */
export const updateProxy = async (message: PostMessage) => {
  let { apiProxyStore } = await getStoreKey<{ apiProxyStore: ApiProxyStore }>(['apiProxyStore']);
  if (apiProxyStore && apiProxyStore.length > 0 && apiProxyStore.some((x) => x.id === message.data.apiProxy.id)) {
    apiProxyStore.forEach((x) => {
      if (x.id === message.data.apiProxy.id) {
        x.isProxy = message.data.apiProxy.isProxy;
        x.isEdit = message.data.apiProxy.isEdit;
        x.method = message.data.apiProxy.method;
        x.name = message.data.apiProxy.name;
        x.proxyContent = message.data.apiProxy.proxyContent;
        x.url = message.data.apiProxy.url;
      }
    });
  } else {
    if (apiProxyStore) {
      apiProxyStore.push(message.data.apiProxy);
    } else {
      apiProxyStore = [message.data.apiProxy];
    }
  }
  console.log('🔥log=>devtool=>108:apiProxyStore:%o', apiProxyStore);
  await setStore({ apiProxyStore: cloneDeep(apiProxyStore) });
};
/**
 * 删除代理
 * @param id
 */
export const deleteProxy = async (id: string) => {
  let { apiProxyStore } = await getStoreKey<{ apiProxyStore: ApiProxyStore }>(['apiProxyStore']);
  if (apiProxyStore && apiProxyStore.length > 0) {
    for (let i = 0; i < apiProxyStore.length; i++) {
      if (apiProxyStore[i].id === id) {
        apiProxyStore.splice(i, 1);
        i--;
      }
    }
  }
  await setStore({ apiProxyStore: cloneDeep(apiProxyStore) });
};
