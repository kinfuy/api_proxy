<template>
  <div class="devtool">
    <span>
      <span v-if="webSite.isProxy">{{ webSite.url }}</span>
    </span>
    <span>
      <el-switch size="small" v-model="webSite.isProxy" @change="handleChange" />
      <span style="margin-left: 5px">代理模式</span>
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref, onMounted, onUnmounted } from 'vue';
import { devToolInjectScriptResult } from './../../libs/chrome';
import { EVENT_KEY } from './../../libs/config/const';
export default defineComponent({
  name: 'Devtool',
  setup() {
    const webSite: Ref<WebSite> = ref({
      id: '',
      url: '',
      storeKey: '',
      isProxy: false,
    });
    let backgroundConnect: undefined | chrome.runtime.Port = undefined;
    const initDevtool = async () => {
      if (backgroundConnect) return;
      // 与后台页面消息通信-长连接
      const port = chrome.runtime.connect(chrome.runtime.id, { name: 'devtools' });
      // 往后台页面发送消息
      const url = await devToolInjectScriptResult(`window.location.href`);
      if (url && chrome.devtools.inspectedWindow.tabId) {
        port.postMessage({
          from: 'devtools',
          key: EVENT_KEY.API_PROXY_DEVTOOL_INIT,
          data: {
            tabId: chrome.devtools.inspectedWindow.tabId,
            url,
          },
        });
      }
      return port;
    };

    const addListenerHandler = (message: PostMessage) => {
      if (message.from == 'background') {
        switch (message.key) {
          case EVENT_KEY.API_PROXY_DEVTOOL_INIT:
            {
              webSite.value = message.data.webSite;
            }
            break;
          case EVENT_KEY.API_PROXY_WEBSITE_SWITCH:
            {
              webSite.value = message.data.webSite;
            }
            break;
          default:
            break;
        }
      }
    };
    onMounted(async () => {
      backgroundConnect = await initDevtool();
      if (backgroundConnect) backgroundConnect.onMessage.addListener(addListenerHandler);
    });
    onUnmounted(() => {
      if (backgroundConnect) {
        backgroundConnect.disconnect();
        backgroundConnect = undefined;
      }
    });
    const handleChange = async () => {
      const url = await devToolInjectScriptResult(`window.location.href`);
      if (backgroundConnect)
        backgroundConnect.postMessage({
          from: 'devtools',
          key: EVENT_KEY.API_PROXY_WEBSITE_SWITCH,
          data: { url, webSite: webSite.value },
        });
    };
    return { webSite, handleChange };
  },
});
</script>
<style lang="less" scoped>
.devtool {
  display: flex;
  justify-content: space-between;
  padding: 20px 40px;
}
</style>
