// const beforeFetchRequest = (
//   apiProxys: ApiProxy[],
//   input: RequestInfo,
//   init?: RequestInit
// ): Promise<CustomRequestConfig> => {
//   return new Promise((resolve) => {
//     let isMock = false;
//     let apiProxy: ApiProxy | undefined = undefined;
//     if (
//       apiProxys.some(
//         (x) =>
//           x.isProxy &&
//           x.method === init?.method?.toLocaleUpperCase() &&
//           IsurlMatch(input.toString(), [x.url])
//       )
//     ) {
//       apiProxys.forEach((x) => {
//         if (
//           x.method === init?.method?.toLocaleUpperCase() &&
//           IsurlMatch(input.toString(), [x.url])
//         ) {
//           apiProxy = x; // 获取代理信息
//         }
//       });
//       isMock = true;
//       console.log(`[ApiProxy]: 拦截到:${init?.method}  ${input}`);
//     }

//     if (isMock && apiProxy && init) {
//       const headers =
//         (apiProxy as ApiProxy).proxyContent.request.header
//           .replace(/^"|"$/g, '')
//           .split(',') || [];
//       headers.forEach((x: string) => {
//         const item = x.split(':');
//         if (item[0] && item[0] !== '') {
//           if (init.headers)
//             (init.headers as Record<string, any>)[item[0] as string] = item[1];
//           console.log(`[ApiProxy]: 已添加请求头: ${item[0]}:${item[1]}`);
//         }
//       });

//       if (
//         (apiProxy as ApiProxy).proxyContent.request.isOriginCatch !== true &&
//         (apiProxy as ApiProxy).proxyContent.request.data
//       ) {
//         if (init?.method === 'get')
//           input = `${input}?${
//             (apiProxy as ApiProxy).proxyContent.request.data
//           }`;
//         if (init?.method === 'post')
//           init.body = (apiProxy as ApiProxy).proxyContent.request.data;
//         console.log('[ApiProxy]: fetch请求参数已被apisProxy代理');
//       } else {
//         if (init?.method === 'get')
//           (apiProxy as ApiProxy).proxyContent.request.data = getQueryString(
//             input.toString()
//           );
//         if (init?.method === 'post')
//           (apiProxy as ApiProxy).proxyContent.request.data = JSON.stringify(
//             init.body
//           );
//         (apiProxy as ApiProxy).proxyContent.request.isOriginCatch === true;
//         sendMessageToContent('API_PROXY_INJECT_UPDATA', {
//           url: window.location.href,
//           apiProxy: cloneDeep(apiProxy),
//         });
//       }
//     }
//     resolve({
//       input,
//       init,
//       isMock,
//       apiProxy,
//     });
//   });
// };
// const beforeFetchResponse = function (
//   apiProxy: ApiProxy,
//   response: Response
// ): Promise<Response> {
//   return new Promise((resolve) => {
//     if (response.body) {
//       const data = response.clone().json();
//       if (
//         apiProxy.proxyContent.response.data &&
//         apiProxy.proxyContent.response.isOriginCatch !== true
//       ) {
//         const bodyInit = {
//           ok: response.ok,
//           redirected: response.redirected,
//           type: response.type,
//           url: response.url,
//           bodyUsed: response.bodyUsed,
//         };
//         const stream = createStream(
//           JSON.stringify(apiProxy.proxyContent.response.data)
//         );
//         const modifyData = new Response(stream, {
//           ...bodyInit,
//           headers: response.headers,
//           status: response.status,
//           statusText: response.statusText,
//         });
//         resolve(modifyData);
//       } else {
//         apiProxy.proxyContent.response.data = JSON.stringify(data);
//         apiProxy.proxyContent.response.isOriginCatch = true;
//         sendMessageToContent('API_PROXY_INJECT_UPDATA', {
//           url: window.location.href,
//           apiProxy: cloneDeep(apiProxy),
//         });
//         resolve(response);
//       }
//     } else {
//       resolve(response);
//     }
//   });
// };

export interface GlobalProxyContext {
  initCOntent?: FetchInit;
  resContent?: Response;
}

export type FetchInit = {
  input: RequestInfo | URL;
  init?: RequestInit | undefined;
};

export type BeforeFetchRequest = (
  body: FetchInit,
  context: GlobalProxyContext
) => Promise<FetchInit>;
export type AfterFetchRequest = (
  body: FetchInit,
  context: GlobalProxyContext
) => void;
export type BeforeFetchResponse = (
  context: GlobalProxyContext
) => Promise<Response>;

export type AfterFetchResponse = (
  body: Response,
  context: GlobalProxyContext
) => void;

export interface FetchHooks {
  beforeFetchRequest?: BeforeFetchRequest;
  afterFetchRequest?: AfterFetchRequest;
  beforeFetchResponse?: BeforeFetchResponse;
  afterFetchResponse?: AfterFetchResponse;
}
export interface FetchParameter extends FetchHooks {
  originFetch: typeof window.fetch;
}

export const initFetchProxy = ({
  originFetch,
  beforeFetchRequest,
  afterFetchRequest,
  beforeFetchResponse,
  afterFetchResponse,
}: FetchParameter) => {
  const globalContext: GlobalProxyContext = {};
  const selfFetchproxy = async (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => {
    const originFetchInit = { input, init };
    globalContext.initCOntent = originFetchInit;
    const fetchInit = beforeFetchRequest
      ? await beforeFetchRequest(originFetchInit, globalContext)
      : originFetchInit;
    afterFetchRequest && afterFetchRequest(originFetchInit, globalContext);
    beforeFetchResponse && beforeFetchResponse(globalContext);
    const originResponse = await originFetch(fetchInit.input, fetchInit.init);
    globalContext.resContent = originResponse;
    const response =
      afterFetchResponse && afterFetchResponse(originResponse, globalContext);
    if (response) return response;
    return originResponse;
  };
  return selfFetchproxy;
};
