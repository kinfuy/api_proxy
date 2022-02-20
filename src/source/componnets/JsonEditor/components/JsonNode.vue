<template>
  <div
    v-if="stateData"
    :class="['json-node', { 'node-active': (isHover || isEdit) && !isExtend }]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span v-if="!stateData.root" class="json-node-key" :style="{ color: keyColor }">
      <ValueEditor
        :disabled="typeof stateData.key === 'number' || disabled"
        :value="stateData.key"
        @change="handleValueChange($event, 'key', json)"
        @focus="handleValueFocus"
        @blur="handleValueBlur"
      ></ValueEditor>
    </span>
    <span v-if="!stateData.root" class="json-node-separator">:</span>
    <span :class="['json-node-value']">
      <span v-if="isSub" class="hidden-separator" @click="handleExtend()">
        <IconSvg v-if="isExtend" fix-class="json-node-icon json-node-icon-blue" if="isExtend" name="icon-zhankai"></IconSvg>
        <IconSvg v-else fix-class="json-node-icon json-node-icon-blue" name="icon-zhankai-copy"></IconSvg>
      </span>
      <span v-if="isSub">{{ stateData.type === 'object' ? '{' : '[' }}</span>
      <span v-if="isSub && isExtend && !disabled" class="json-node-icon-add" @click="handleAddAttr()">
        <IconSvg fix-class="json-node-operate-icon" name="icon-tianjia"></IconSvg>
      </span>
      <span v-if="isSub && !isExtend">......</span>
      <ValueEditor
        v-if="!isSub"
        :value="stateData.value"
        :disabled="disabled"
        @change="handleValueChange($event, 'value', json)"
        @focus="handleValueFocus"
        @blur="handleValueBlur"
      ></ValueEditor>
      <template v-else>
        <slot v-if="isExtend" name="sub-node" :node="json.value"></slot>
        <span>{{ json.type === 'object' ? '}' : ']' }}</span>
      </template>
      <span
        v-if="!disabled && !isExtend && !stateData.root"
        :class="['json-node-icon-switch', { 'node-icon-switch-active': isHover }]"
        :title="stateData.type"
        @click="handleSwitch(stateData)"
      >
        <IconSvg fix-class="json-node-operate-icon" name="icon-yangshi_icon_tongyong_swap"></IconSvg>
      </span>
      <span
        v-if="!disabled && !isExtend && !stateData.root"
        :class="['json-node-icon-delete', { 'node-icon-delete-active': isHover }]"
        @click="handleAttrDelete()"
      >
        <IconSvg fix-class="json-node-operate-icon" name="icon-delete"></IconSvg>
      </span>
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, watch, inject, computed } from 'vue';
import ValueEditor from './ValueEditor.vue';
import IconSvg from './Icon/IconSvg.vue';
import { typeOf, _UUID } from '../utils';
import clonedeep from 'lodash.clonedeep';
import { defaultConfig } from './../libs/defaultConfig';
export default defineComponent({
  name: 'JsonNode',
  components: { ValueEditor, IconSvg },
  props: {
    json: {
      type: Object as PropType<JsonItem>,
      required: true,
    },
    currectLevel: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const stateData = ref<JsonItem>();
    const { extendLevel, extendAll, extendCatchKey, disabled, jsonConfig } = inject('JsonEditorContext') as JsonEditorContext;

    watch(
      () => props.json,
      (val) => {
        stateData.value = val;
      },
      {
        immediate: true,
      }
    );
    const isSub = computed(() => {
      return stateData.value && (stateData.value.type === 'array' || stateData.value.type === 'object');
    });

    const isExtend = ref(false);
    const eventTrigger = inject('eventTrigger') as EventTrigger;
    watch(
      () => extendLevel.value,
      (val) => {
        const extend = extendCatchKey.value.some((x) => {
          return x.key === props.json.key && x.level === props.currectLevel;
        });
        if (val >= props.currectLevel || extendAll.value || extend) {
          isExtend.value = true;
          eventTrigger('extend', {
            isExtend: isExtend.value,
            key: props.json.key,
            level: props.currectLevel,
          });
        }
      },
      {
        immediate: true,
      }
    );
    const handleExtend = () => {
      isExtend.value = !isExtend.value;
      eventTrigger('extend', { isExtend: isExtend.value, key: props.json.key, level: props.currectLevel });
    };

    const handleSwitch = (item: JsonItem) => {
      const switchType = ['array', 'object', 'string'];
      const currect = switchType.findIndex((x) => x === item.type);

      // 缓存转换数据类型之前数据
      if (typeOf(item.value) === 'array') {
        if (item.value.length > 0) {
          item.catchValue = {
            type: item.type,
            value: item.value,
          };
        }
      } else if (item.value) {
        item.catchValue = {
          type: item.type,
          value: item.value,
        };
      }
      // 转换数据类型
      if (currect + 1 <= switchType.length - 1) {
        item.type = switchType[currect + 1];
      } else {
        item.type = switchType[0];
      }
      if (item.type === 'array' || item.type === 'object') {
        item.value = [];
      } else {
        item.value = '';
      }

      // 如果转化为初始数据类型，将缓存数据带回
      if (item.catchValue && item.catchValue.type === item.type) {
        item.value = item.catchValue.value;
        delete item.catchValue;
      }
    };

    // 鼠标悬浮
    const hoverNodeId = ref('');
    const handleMouseEnter = () => {
      hoverNodeId.value = stateData.value?.id || '';
    };
    const handleMouseLeave = () => {
      hoverNodeId.value = '';
    };
    const isHover = computed(() => {
      return hoverNodeId.value === stateData.value?.id;
    });

    // 修改json
    const handleValueChange = (value: any, type: 'key' | 'value', item: JsonItem) => {
      item[type] = value;
      if (eventTrigger) eventTrigger('change', clonedeep(stateData.value));
    };

    // node-active
    const currectEditId = ref();
    const handleValueFocus = () => {
      currectEditId.value = stateData.value?.id;
    };
    const isEdit = computed(() => {
      return currectEditId.value === stateData.value?.id;
    });
    const handleValueBlur = () => {
      currectEditId.value = undefined;
    };
    // 添加属性
    const handleAddAttr = () => {
      const key = stateData.value?.type === 'array' ? stateData.value.value.length : 'defalut';
      const neWAttr = {
        id: _UUID(),
        key: key,
        value: 'new attr',
        type: 'string',
      };
      const addType = jsonConfig.value.addType !== undefined ? jsonConfig.value.addType : defaultConfig.addType;
      if (addType && stateData.value?.type !== 'array') {
        stateData.value?.value.unshift(neWAttr);
      } else {
        stateData.value?.value.push(neWAttr);
      }
      if (eventTrigger) eventTrigger('change', clonedeep(stateData.value));
    };

    // 删除属性
    const handleAttrDelete = () => {
      if (eventTrigger) eventTrigger('delete', clonedeep(stateData.value));
      eventTrigger('extend', { isExtend: isExtend.value, key: props.json.key, level: props.currectLevel });
    };

    // key color
    const keyColor = computed(() => {
      let rst = '';
      if (stateData.value) {
        rst = defaultConfig.keyColor[stateData.value.type];
      }
      if (jsonConfig.value && jsonConfig.value.keyColor && stateData.value) {
        if (jsonConfig.value.keyColor[stateData.value.type]) {
          rst = jsonConfig.value.keyColor[stateData.value.type];
        }
      }
      return rst;
    });
    return {
      stateData,
      isSub,
      isEdit,
      isExtend,
      extendLevel,
      extendAll,
      keyColor,
      extendCatchKey,
      disabled,
      handleExtend,
      handleSwitch,
      isHover,
      handleMouseEnter,
      handleMouseLeave,
      handleValueChange,
      handleAddAttr,
      handleAttrDelete,
      handleValueFocus,
      handleValueBlur,
    };
  },
});
</script>
<style lang="less" scoped>
.json-node {
  & .json-node {
    padding-left: 40px;
  }
  .json-node-key {
    position: relative;
    display: inline-block;
    font-size: 14px;
    text-align: right;
    font-weight: 600;
    color: rgb(23, 154, 241);
    text-align: left;
    min-width: 20px;
    z-index: 2;
  }
  .json-node-value {
    position: relative;
    z-index: 2;
    .json-node-icon-delete {
      display: none;
    }
    .json-node-icon-switch {
      display: none;
      margin-left: 10px;
    }
    .node-icon-switch-active {
      display: inline-block;
      cursor: pointer;
      color: #71aff1;
    }
    .node-icon-delete-active {
      display: inline-block;
      cursor: pointer;
      color: red;
    }
    .json-node-icon {
      padding: 2px;
      border-radius: 2px;
      width: 16px;
      height: 16px;
      color: #fff;
    }
    .json-node-icon-blue {
      background-color: #71aff1;
    }
    .json-node-icon-add {
      cursor: pointer;
      color: #71aff1;
      &:hover {
        color: red;
      }
    }
    .hidden-separator {
      cursor: pointer;
      margin: 0 5px;
      font-weight: 600;
      &:hover {
        color: red;
      }
    }
    .json-node-operate-icon {
      width: 16px;
      height: 16px;
      margin-left: 2px;
      cursor: pointer;
    }
  }
  .json-node-separator {
    position: relative;
    z-index: 2;
    margin: 0 4px;
    font-weight: 600;
  }
}
.node-active {
  position: relative;
  &::before {
    position: absolute;
    right: 0;
    left: 0;
    height: 24px;
    transition: all 0.3s;
    content: '';
    background-color: rgb(219, 235, 252);
    z-index: 1;
  }
}
</style>
