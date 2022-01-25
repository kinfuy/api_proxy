<template>
  <div class="devtool-header">
    <span
      ><span v-if="webSite.isProxy">{{ webSite.url }}</span>
    </span>
    <span>
      <el-switch size="small" v-model="webSite.isProxy" @change="handleChange" />
      <span style="margin-left: 5px">代理模式</span>
    </span>
  </div>
  <div v-if="webSite.isProxy" class="devtool-content">
    <div v-if="webSite.isProxy" @click="handleApiProxyAdd" class="api-proxy-btn">新增</div>
    <el-collapse v-if="apiProxy.length > 0" v-model="activeName" accordion>
      <el-collapse-item v-for="item in apiProxy" :key="item.id" :title="item.name" :name="item.id">
        <template #title>
          <div @click="stopPropagation" class="api-item">
            <div class="api-info">
              <el-input :disabled="!item.isEdit" size="small" v-model="item.url" placeholder="eg:api/login" class="input-with-select">
                <template #prepend>
                  <el-select :disabled="!item.isEdit" size="small" v-model="item.method" placeholder="Method" style="width: 95px">
                    <el-option label="GET" value="GET"></el-option>
                    <el-option label="POST" value="POST"></el-option>
                  </el-select>
                </template>
              </el-input>
            </div>
            <div class="api-btn">
              <span>
                <el-switch size="small" v-model="item.isProxy" @change="handleChange" />
              </span>
              <span @click="handleEdit(item)" class="api-text text-edit">{{ item.isEdit ? '保存' : '编辑' }}</span>
              <span class="api-text text-delete">删除</span>
            </div>
          </div>
        </template>
        <div class="api-editor">
          <div class="api-editor-title">
            <span>响应参数</span>
          </div>
          <div class="response-data">
            <el-input
              :autosize="{ minRows: 2, maxRows: 4 }"
              v-model="item.proxyContent.responseData"
              type="textarea"
              placeholder="开启代理后会默认缓存上次响应参数，缓存参数不会进行拦截"
            />
          </div>
          <div>请求参数</div>
          <div class="request-data">
            <el-input
              :autosize="{ minRows: 2, maxRows: 4 }"
              v-model="item.proxyContent.requestData"
              type="textarea"
              placeholder="开启代理后会默认缓存上次请求参数，缓存参数不会进行拦截"
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref, onMounted, onUnmounted, computed } from 'vue';
import { devToolInjectScriptResult } from './../../libs/chrome';
import { EVENT_KEY } from './../../libs/config/const';
import MOCK from 'mockjs';
import { UUID } from '../../libs/utils';
interface ApiProxyDevtool extends ApiProxy {
  isEdit: boolean;
  isShowJson: boolean;
  isMock: boolean;
}
export default defineComponent({
  name: 'Devtool',
  setup() {
    const webSite: Ref<WebSite> = ref({
      id: '',
      url: '',
      storeKey: '',
      isProxy: false,
    });
    const apiProxy: Ref<ApiProxyDevtool[]> = ref([]);
    const activeName = ref('');
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

    const handleApiProxyAdd = () => {
      apiProxy.value.push({
        id: UUID(),
        name: webSite.value.storeKey,
        url: '',
        isProxy: false,
        method: 'GET',
        isEdit: false,
        isShowJson: false,
        isMock: false,
        proxyContent: {
          isOriginCatch: false,
          requestData: '',
          responseData: '',
          requestHeader: '',
          responseHeader: '',
        },
      });
    };
    const handleEdit = (item: ApiProxyDevtool) => {
      if (item.isEdit) {
        console.log('保存');
        item.isEdit = false;
      } else {
        item.isEdit = true;
      }
    };

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };
    return { webSite, apiProxy, handleChange, handleApiProxyAdd, handleEdit, activeName, stopPropagation };
  },
});
</script>
<style lang="less">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
.devtool-header {
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 20px;
  z-index: 9;
  background-color: #fff;
}
.devtool-content {
  padding: 40px 20px;
  .api-proxy-btn {
    display: inline-block;
    padding: 4px 8px;
    background-color: #409eff;
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
    &:hover {
      opacity: 0.8;
    }
  }
  .api-item {
    display: flex;
    align-items: center;
    width: 100%;
    .api-info {
      width: 100%;
    }
    .api-btn {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin: 0 30px 0 20px;
      .api-text {
        font-size: 12px;
        color: #333;
        margin-left: 10px;
      }
      .text-edit {
        &:hover {
          color: #409eff;
        }
      }
      .text-delete {
        &:hover {
          color: #f56c6c;
        }
      }
    }
  }
}
</style>
