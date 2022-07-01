import { addEventListener } from '../libs/utils';
import { EVENT_KEY } from '../libs/config/const';
import { initFetchProxy, initXMLHttpRequest } from '../libs/plugin/proxy';
import { replaceFetchDate } from '../libs/utils/proxy';
import type {
  AfterFetchResponse,
  BeforeFetchRequest,
  FetchHooks,
} from '../libs/plugin/fetchProxy';
import type {
  AfterXmlResponese,
  BeforeXmlOpen,
  BeforeXmlResponse,
  BeforeXmlSend,
  XMLHttpHooks,
} from '../libs/plugin/xmlProxy';
const originXML = window.XMLHttpRequest;
const originFetch = window.fetch;

const createXmlHooks = (): XMLHttpHooks => {
  const beforeXmlOpen: BeforeXmlOpen = (body, conetnt) => {
    console.log('beforeXmlOpen', body);
    return body;
  };
  const beforeXmlSend: BeforeXmlSend = (body, conetnt) => {
    console.log('beforeXmlSend', body);
    return body;
  };
  const beforeXmlResponse: BeforeXmlResponse = (conetnt) => {
    console.log('beforeXmlResponse');
    return {};
  };
  const afterXmlResponese: AfterXmlResponese = (body, context) => {
    console.log('afterXmlResponese', body);
  };

  return {
    beforeXmlOpen,
    beforeXmlSend,
    beforeXmlResponse,
    afterXmlResponese,
  };
};

const createFetchHooks = (): FetchHooks => {
  const beforeFetchRequest: BeforeFetchRequest = (body, context) => {
    console.log('beforeFetchRequest', body);
    return Promise.resolve(body);
  };
  const afterFetchResponse: AfterFetchResponse = (body, context) => {
    console.log('afterFetchResponse', body);
    const response = replaceFetchDate(
      body,
      { test: 'success' },
      { status: 401 }
    );
    return Promise.resolve(response);
  };
  return {
    beforeFetchRequest,
    afterFetchResponse,
  };
};

const initProxy = (xmlHooks: XMLHttpHooks, fetchHooks: FetchHooks) => {
  const selfFetchproxy = initFetchProxy({
    originFetch,
    ...fetchHooks,
  });
  const SelfXmlHttpRequest = initXMLHttpRequest({ originXML, ...xmlHooks });
  window.XMLHttpRequest = SelfXmlHttpRequest;
  window.fetch = selfFetchproxy;
};

addEventListener(window, 'message', (info: any) => {
  const message = info.data as PostMessage;
  if (message.from !== 'content_script') return;
  switch (message.key) {
    case EVENT_KEY.API_PROXY_BACKGROUND_UPDATE: {
      console.log('[ApiProxy]: 已重载');
      // 监听到背景页通知需要更新代理信息
      // 重新初始化xml fetch
      const hooks = createXmlHooks();
      initProxy(hooks, fetchHooks);
      break;
    }
    case EVENT_KEY.API_PROXY_INJECT_INIT: {
      console.log('[ApiProxy]: 已重载');
      // 监听到背景页通知需要更新代理信息
      // 重新初始化xml fetch
      const hooks = createXmlHooks();
      initProxy(hooks, fetchHooks);
      break;
    }
    default: {
      break;
    }
  }
});

const xmlHooks = createXmlHooks();
const fetchHooks = createFetchHooks();
initProxy(xmlHooks, fetchHooks);
