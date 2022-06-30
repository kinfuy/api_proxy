<template>
  <div class="devtool-header">
    <span
      ><span v-if="webSite.isProxy">{{ webSite.url }}</span>
    </span>
    <span>
      <el-switch
        v-model="webSite.isProxy"
        size="small"
        @change="handleChange"
      />
      <span style="margin-left: 5px">代理模式</span>
    </span>
  </div>
  <div v-if="webSite.isProxy" class="devtool-content">
    <div
      v-if="webSite.isProxy"
      class="api-proxy-btn"
      @click="handleApiProxyAdd"
    >
      新增
    </div>
    <el-collapse v-if="apiProxy.length > 0" v-model="activeName" accordion>
      <el-collapse-item
        v-for="item in apiProxy"
        :key="item.id"
        :title="item.name"
        :name="item.id"
      >
        <template #title>
          <div class="api-item" @click="stopPropagation">
            <div class="api-info">
              <el-input
                v-model="item.url"
                :disabled="!item.isEdit"
                size="small"
                placeholder="eg:api/login"
                class="input-with-select"
              >
                <template #prepend>
                  <el-select
                    v-model="item.method"
                    :disabled="!item.isEdit"
                    size="small"
                    placeholder="Method"
                    style="width: 95px"
                  >
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                  </el-select>
                </template>
              </el-input>
            </div>
            <div class="api-btn">
              <span>
                <el-switch
                  v-model="item.isProxy"
                  size="small"
                  @change="handleAPiChange(item)"
                />
              </span>
              <span class="api-text text-edit" @click="handleEdit(item)">{{
                item.isEdit ? '保存' : '编辑'
              }}</span>
              <span class="api-text text-delete" @click="handleDelete(item)"
                >删除</span
              >
            </div>
          </div>
        </template>
        <div class="api-editor">
          <div class="api-editor-title">
            <span style="font-weight: 700">响应参数</span>
            <!-- <div class="api-text text-edit">MOCK</div> -->
            <div
              :class="[
                'api-text',
                'text-edit',
                { 'text-active': !item.proxyContent.response.showJson },
              ]"
              @click="item.proxyContent.response.showJson = false"
            >
              源数据
            </div>
            <div
              :class="[
                'api-text',
                'text-edit',
                { 'text-active': item.proxyContent.response.showJson },
              ]"
              @click="handleShowJson(item)"
            >
              JSON
            </div>
          </div>
          <div class="response-data">
            <SimpleJson
              v-if="item.proxyContent.response.showJson"
              :json="JsonEditorData"
              :config="jsonConfig"
              :disabled="!item.isEdit"
              :extend-all="false"
              :extend-level="1"
              @change="handleJsonEditorChange($event, item)"
            />
            <el-input
              v-else
              v-model="item.proxyContent.response.data"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              :disabled="!item.isEdit"
              placeholder="开启代理后会默认缓存真实响应参数，缓存参数不会进行拦截"
            />
          </div>
          <div class="api-editor-title">
            <span style="font-weight: 700">请求参数</span>
            <div class="api-text text-edit text-active">源数据</div>
            <!-- <div class="api-text text-edit">JSON</div> -->
          </div>
          <div class="request-data">
            <el-input
              v-model="item.proxyContent.request.data"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              :disabled="!item.isEdit"
              placeholder="开启代理后会默认缓存真实请求参数，缓存参数不会进行拦截"
            />
          </div>
          <div class="api-editor-title">
            <span style="font-weight: 700">请求头</span>
          </div>
          <div class="request-data">
            <el-input
              v-model="item.proxyContent.request.header"
              :autosize="{ minRows: 1, maxRows: 2 }"
              type="textarea"
              :disabled="!item.isEdit"
              placeholder="追加请求头,多个用英文逗号分割"
            />
          </div>
          <div class="api-editor-title">
            <span style="font-weight: 700">响应头</span>
          </div>
          <div class="request-data">
            <el-input
              v-model="item.proxyContent.response.header"
              :autosize="{ minRows: 1, maxRows: 2 }"
              type="textarea"
              :disabled="true"
              placeholder="开启代理后会默认缓存真实响应参数，缓存参数不会进行拦截"
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import cloneDeep from 'lodash.clonedeep';

import { ElLoading } from 'element-plus';
import { UUID } from '../../../libs/utils';
import {
  chromeAddListenerMessage,
  devToolInjectScriptResult,
} from '../../../libs/chrome';
import { EVENT_KEY } from '../../../libs/config/const';
import type { Ref } from 'vue';
export default defineComponent({
  name: 'Devtool',
  setup() {
    const webSite: Ref<WebSite> = ref({
      id: '',
      url: '',
      storeKey: '',
      isProxy: false,
    });
    const apiProxy: Ref<ApiProxy[]> = ref([]);
    const activeName = ref('');
    let backgroundConnect: undefined | chrome.runtime.Port = undefined;
    const initDevtool = async () => {
      if (backgroundConnect) return;
      // 与后台页面消息通信-长连接
      const port = chrome.runtime.connect(chrome.runtime.id, {
        name: 'devtools',
      });
      // 往后台页面发送消息
      const url = await devToolInjectScriptResult(`window.location.href`);
      if (url && chrome.devtools.inspectedWindow.tabId) {
        port.postMessage({
          from: 'devtools',
          key: EVENT_KEY.API_PROXY_DEVTOOL_INIT,
          data: { url },
        });
      }
      return port;
    };
    const devToolUpdata = (message: PostMessage) => {
      webSite.value = cloneDeep(message.data.webSite);
      message.data.apiProxy.forEach((x: ApiProxy) => {
        if (
          typeof x.proxyContent.response.data === 'object' &&
          x.proxyContent.response.data !== null
        ) {
          x.proxyContent.response.data = JSON.stringify(
            x.proxyContent.response.data
          );
        }
      });
      apiProxy.value = cloneDeep(message.data.apiProxy);
    };
    const addListenerHandler = (message: PostMessage) => {
      if (message.from !== 'background') return;
      switch (message.key) {
        case EVENT_KEY.API_PROXY_DEVTOOL_INIT: {
          devToolUpdata(message);
          break;
        }
        case EVENT_KEY.API_PROXY_INJECT_INIT: {
          const loading = ElLoading.service({
            lock: true,
            text: 'apiProxy重载中',
          });
          setTimeout(() => {
            loading.close();
          }, 500);
          devToolUpdata(message);
          break;
        }
        case EVENT_KEY.API_PROXY_BACKGROUND_UPDATE: {
          devToolUpdata(message);
          break;
        }

        default:
          break;
      }
    };

    onMounted(async () => {
      chromeAddListenerMessage(addListenerHandler);
      backgroundConnect = await initDevtool();
      if (backgroundConnect)
        backgroundConnect.onMessage.addListener(addListenerHandler);
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
          key: EVENT_KEY.API_PROXY_DEVTOOL_WEBSITE_UPDATA,
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
        isEdit: true,
        proxyContent: {
          request: {
            isOriginCatch: false,
            showJson: false,
            showMock: false,
            data: '',
            header: '',
          },
          response: {
            isOriginCatch: false,
            showJson: false,
            showMock: false,
            data: '',
            header: '',
          },
        },
      });
    };
    const handleAPiChange = (item: ApiProxy) => {
      if (item.isEdit) {
        item.isProxy = false;
        return;
      }
      const apiProxy = cloneDeep(item);
      try {
        apiProxy.proxyContent.response.data = JSON.parse(
          apiProxy.proxyContent.response.data
        );
      } catch (error) {}
      if (backgroundConnect) {
        backgroundConnect.postMessage({
          from: 'devtools',
          key: EVENT_KEY.API_PROXY_DEVTOOL_API_UPDATA,
          data: {
            webSite: webSite.value,
            apiProxy,
          },
        });
      }
    };
    const handleEdit = (item: ApiProxy) => {
      if (item.isEdit) {
        if (backgroundConnect) {
          item.isEdit = false;
          item.proxyContent.request.isOriginCatch = false;
          item.proxyContent.response.isOriginCatch = false;
          const apiProxy = cloneDeep(item);
          try {
            apiProxy.proxyContent.response.data = JSON.parse(
              apiProxy.proxyContent.response.data
            );
          } catch (error) {}
          backgroundConnect.postMessage({
            from: 'devtools',
            key: EVENT_KEY.API_PROXY_DEVTOOL_API_UPDATA,
            data: {
              webSite: webSite.value,
              apiProxy,
            },
          });
        }
      } else {
        item.isEdit = true;
        item.isProxy = false;
      }
    };
    const handleDelete = (item: ApiProxy) => {
      if (backgroundConnect) {
        backgroundConnect.postMessage({
          from: 'devtools',
          key: EVENT_KEY.API_PROXY_DEVTOOL_DELETE,
          data: { url: webSite.value.url, id: item.id },
        });
      }
    };
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    // json 视图
    const jsonConfig = {
      keyColor: {
        string: '#548CFF',
        number: '#333',
        array: '#FF9F45',
        object: '#139487',
        boolean: '#66806A',
      },
      addType: true,
    };
    const JsonEditorData = ref();
    const handleJsonEditorChange = (val: string, item: ApiProxy) => {
      item.proxyContent.response.data = val;
      JsonEditorData.value = val;
    };

    const handleShowJson = (item: ApiProxy) => {
      JsonEditorData.value = item.proxyContent.response.data;
      item.proxyContent.response.showJson = true;
    };
    return {
      webSite,
      apiProxy,
      handleChange,
      handleApiProxyAdd,
      handleEdit,
      handleDelete,
      activeName,
      stopPropagation,
      handleAPiChange,
      handleJsonEditorChange,
      handleShowJson,
      JsonEditorData,
      jsonConfig,
    };
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
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    & + .api-proxy-btn {
      margin-left: 10px;
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

      .text-delete {
        &:hover {
          color: #f56c6c;
        }
      }
    }
  }

  .api-editor {
    .api-editor-title {
      margin-bottom: 5px;
    }
  }
}

.api-text {
  display: inline-block;
  font-size: 12px;
  color: #333;
  margin-left: 10px;
  cursor: pointer;
}

.text-edit {
  &:hover {
    color: #409eff;
  }

  &.text-active {
    color: #409eff;
  }
}

.view-code-json {
  width: 100%;
  height: 100%;
  overflow: auto;
  max-height: 300px;
  padding: 20px;
  background-color: #333;
  color: #fff;
}
</style>
