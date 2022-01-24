const originFetch = window.fetch;
import { createStream, windowPostMessage } from './../utils';
const beforeFetchRequest = function (input: RequestInfo, init?: RequestInit): Promise<requestConfig> {
  return new Promise((resolve, resject) => {
    resolve({
      input: input,
      init: init,
    });
  });
};
const beforeFetchResponse = function (response: Response): Promise<Response> {
  return new Promise(async (resolve, resject) => {
    const data = await response.clone().json();
    if (!response.body) {
      resolve(response);
    } else {
      const stream = createStream(JSON.stringify(data));
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
    }
  });
};
export const self_fetch_proxy = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const originResponse = await originFetch(input, init);
  return originResponse;
};

export const initFetchProxy = () => {};
