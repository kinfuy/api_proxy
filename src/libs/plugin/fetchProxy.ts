import cloneDeep from 'lodash.clonedeep';
import { EventKey } from '../config/const';
import { createStream, windowPostMessage, IsurlMatch } from './../utils';
import { getQueryString } from './../utils/dom';
const sendMessageToContent = (key: EventKey, data: any) => {
  const message: PostMessage = { from: 'inject_script', key, data };
  windowPostMessage(message);
};
const beforeFetchRequest = function (apiProxys: ApiProxy[], input: RequestInfo, init?: RequestInit): Promise<CustomRequestConfig> {
  return new Promise((resolve, resject) => {
    let isMock = false;
    let apiProxy: ApiProxy | undefined = undefined;
    if (apiProxys.some((x) => x.isProxy && x.method === init?.method?.toLocaleUpperCase() && IsurlMatch(input.toString(), [x.url]))) {
      apiProxys.forEach((x) => {
        if (x.method === init?.method?.toLocaleUpperCase() && IsurlMatch(input.toString(), [x.url])) {
          apiProxy = x; // 获取代理信息
          console.log('🔥log=>fetchProxy=>24:init:%o', init);
        }
      });
      isMock = true;
      console.log(`[ApiProxy]: 拦截到:${init?.method}  ${input}`);
    }

    if (isMock && apiProxy && init) {
      const headers = (apiProxy as ApiProxy).proxyContent.request.header.replace(/^"|"$/g, '').split(',') || [];
      console.log('🔥log=>fetchProxy=>26:headers:%o', headers);
      headers.forEach((x: string) => {
        const item = x.split(':');
        if (item[0] && item[0] !== '') {
          if (init.headers) (init.headers as Record<string, any>)[item[0] as string] = item[1];
          console.log(`[ApiProxy]: 已添加请求头: ${item[0]}:${item[1]}`);
        }
      });

      if ((apiProxy as ApiProxy).proxyContent.request.isOriginCatch !== true && (apiProxy as ApiProxy).proxyContent.request.data) {
        if (init?.method === 'get') input = `${input}?${(apiProxy as ApiProxy).proxyContent.request.data}`;
        if (init?.method === 'post') init.body = (apiProxy as ApiProxy).proxyContent.request.data;
        console.log('[ApiProxy]: fetch请求参数已被apisProxy代理');
      } else {
        if (init?.method === 'get') (apiProxy as ApiProxy).proxyContent.request.data = getQueryString(input.toString());
        if (init?.method === 'post') (apiProxy as ApiProxy).proxyContent.request.data = JSON.stringify(init.body);
        (apiProxy as ApiProxy).proxyContent.request.isOriginCatch === true;
        sendMessageToContent('API_PROXY_INJECT_UPDATA', {
          url: window.location.href,
          apiProxy: cloneDeep(apiProxy),
        });
      }
    }
    resolve({
      input: input,
      init: init,
      isMock,
      apiProxy,
    });
  });
};
const beforeFetchResponse = function (apiProxy: ApiProxy, response: Response): Promise<Response> {
  return new Promise(async (resolve, resject) => {
    if (response.body) {
      const data = await response.clone().json();
      if (apiProxy.proxyContent.response.data && apiProxy.proxyContent.response.isOriginCatch !== true) {
        const stream = createStream(JSON.stringify(apiProxy.proxyContent.response.data));
        const modifyData = new Response(stream, {
          headers: response.headers,
          ok: response.ok,
          redirected: response.redirected,
          status: response.status,
          statusText: response.statusText,
          type: response.type,
          url: response.url,
          bodyUsed: response.bodyUsed,
        });
        resolve(modifyData);
      } else {
        apiProxy.proxyContent.response.data = JSON.stringify(data);
        apiProxy.proxyContent.response.isOriginCatch = true;
        sendMessageToContent('API_PROXY_INJECT_UPDATA', {
          url: window.location.href,
          apiProxy: cloneDeep(apiProxy),
        });
        resolve(response);
      }
    } else {
      resolve(response);
    }
  });
};

export const initFetchProxy = (originFetch: typeof window.fetch, apiProxy: ApiProxy[]) => {
  const self_fetch_proxy = async (input: RequestInfo, init?: RequestInit) => {
    const requestConfig = await beforeFetchRequest(apiProxy, input, init);
    const originResponse = await originFetch(requestConfig.input, requestConfig.init);
    if (requestConfig.apiProxy && requestConfig.isMock) {
      const response = await beforeFetchResponse(requestConfig.apiProxy, originResponse);
      console.log('[ApiProxy]: fetch响应已被apisProxy代理');
      return response;
    }
    return originResponse;
  };
  return self_fetch_proxy;
};
