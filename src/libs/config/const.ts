export type EventKey = keyof typeof EVENT_KEY;
export const EVENT_KEY = {
  API_PROXY_OPEN: 'API_PROXY_OPEN', // 开启代理
  API_PROXY_DEVTOOL_INIT: 'API_PROXY_DEVTOOL_INIT', // devtool初始化
  API_PROXY_WEBSITE_SWITCH: 'API_PROXY_WEBSITE_SWITCH', // 代理切换
};
