export type EventKey = keyof typeof EVENT_KEY;

export const nameSpace = 'API_PROXY';

export const EVENT_KEY = {
  /**
   * DEVTOOL删除 API
   * @param message.data 参数 id url
   */
  API_PROXY_DEVTOOL_DELETE: 'API_PROXY_DEVTOOL_DELETE',

  /**
   * devtool初始化
   * @param message.data 参数url
   */
  API_PROXY_DEVTOOL_INIT: 'API_PROXY_DEVTOOL_INIT',
  /**
   * 网站初始化
   * @param message.data 参数url
   */
  API_PROXY_INJECT_INIT: 'API_PROXY_INJECT_INIT',
  /**
   * INJECT 更新了api
   * @param message.data 参数apiProxy url
   */
  API_PROXY_INJECT_UPDATA: 'API_PROXY_INJECT_UPDATA',
  /**
   * DEVTOOL 更新了api
   * @param message.data 参数apiProxy url
   */
  API_PROXY_DEVTOOL_API_UPDATA: 'API_PROXY_DEVTOOL_API_UPDATA',
  /**
   * DEVTOOL 更新了api
   * @param message.data 参数apiProxy url
   */
  API_PROXY_DEVTOOL_WEBSITE_UPDATA: 'API_PROXY_DEVTOOL_WEBSITE_UPDATA',
  /**
   * 代理信息更新，用于广播消息
   * @param message.data
   */
  API_PROXY_BACKGROUND_UPDATE: 'API_PROXY_BACKGROUND_UPDATE',
};
