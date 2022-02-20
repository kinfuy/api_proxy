<template>
  <div class="json-warper">
    <template v-if="stateData.type !== 'object' && stateData.type !== 'array'">
      <span class="json-node-key">
        <ValueEditor
          :value="stateData.key"
          :disabled="disabled"
          @change="handleValueChange($event, 'key', json)"
        ></ValueEditor>
      </span>
      <span class="json-node-separator">:</span>
      <span class="json-node">
        <ValueEditor
          :value="stateData.value"
          :disabled="disabled"
          @change="handleValueChange($event, 'value', json)"
        ></ValueEditor>
        <span v-if="!disabled" class="json-node-icon-switch" :title="stateData.type" @click="handleSwitch(stateData)">
          <IconSvg fix-class="json-node-operate-icon" name="icon-yangshi_icon_tongyong_swap"></IconSvg>
        </span>
        <span class="json-node-icon-delete">
          <IconSvg v-if="!disabled" fix-class="json-node-operate-icon" name="icon-delete"></IconSvg>
        </span>
      </span>
    </template>
    <template v-else>
      <ValueEditor
        v-if="!stateData.root"
        class="json-node-key"
        :disabled="typeof stateData.key === 'number' || disabled"
        :value="stateData.key"
        @change="handleValueChange($event, 'key', json)"
      ></ValueEditor>
      <span v-if="!stateData.root" class="json-node-separator">:</span>
      <span>
        <span class="hidden-separator" @click="handleExtend()">
          <IconSvg
            v-if="isExtend"
            fix-class="json-node-icon json-node-icon-blue"
            if="isExtend"
            name="icon-zhankai"
          ></IconSvg>
          <IconSvg v-else fix-class="json-node-icon json-node-icon-blue" name="icon-zhankai-copy"></IconSvg>
        </span>
        <span>{{ stateData.type === 'object' ? '{' : '[' }}</span>
        <span v-if="isExtend && !disabled">
          <IconSvg fix-class="json-node-operate-icon json-node-icon-add" name="icon-tianjia"></IconSvg>
        </span>
        <span v-if="!isExtend">......</span>
      </span>
      <template v-for="item in stateData.value" :key="item.id">
        <JsonWarper v-if="isExtend" :json="item" :currect-level="currectLevel + 1"></JsonWarper>
      </template>
      <span>{{ json.type === 'object' ? '}' : ']' }}</span>
      <span
        v-if="!isExtend && !disabled"
        :title="stateData.type"
        class="json-warper-icon-switch"
        @click="handleSwitch(stateData)"
      >
        <IconSvg fix-class="json-node-operate-icon" name="icon-yangshi_icon_tongyong_swap"></IconSvg>
      </span>
      <span v-if="!isExtend && !disabled" class="json-warper-icon-delete">
        <IconSvg fix-class="json-node-operate-icon" name="icon-delete"></IconSvg>
      </span>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, inject, watch } from 'vue';
import ValueEditor from './ValueEditor.vue';
import IconSvg from './Icon/IconSvg.vue';
import { typeOf } from '../utils';
export default defineComponent({
  name: 'JsonWarper',
  components: { ValueEditor, IconSvg },
  props: {
    json: {
      type: Object as PropType<JsonItem>,
      required: true
    },
    currectLevel: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const stateData = ref<JsonItem>();
    watch(
      () => props.json,
      val => {
        stateData.value = val;
      },
      {
        immediate: true
      }
    );
    // 修改json
    const handleValueChange = (value: any, type: 'key' | 'value', item: JsonItem) => {
      item[type] = value;
      if (eventTrigger) eventTrigger('change', stateData.value);
    };

    const eventTrigger = inject('eventTrigger') as EventTrigger;
    const { extendLevel, extendAll, extendCatchKey, disabled } = inject('JsonEditorContext') as JsonEditorContext;
    const isExtend = ref(false);

    watch(
      () => extendLevel.value,
      val => {
        const extend = extendCatchKey.value.some(x => {
          return x.key === props.json.key && x.level === props.currectLevel;
        });
        if (val >= props.currectLevel || extendAll.value || extend) {
          isExtend.value = true;
          eventTrigger('extend', { isExtend: isExtend.value, key: props.json.key, level: props.currectLevel });
        }
      },
      {
        immediate: true
      }
    );
    const handleExtend = () => {
      isExtend.value = !isExtend.value;
      eventTrigger('extend', { isExtend: isExtend.value, key: props.json.key, level: props.currectLevel });
    };

    const handleSwitch = (item: JsonItem) => {
      const switchType = ['array', 'object', 'string'];
      const currect = switchType.findIndex(x => x === item.type);

      // 缓存转换数据类型之前数据
      if (typeOf(item.value) === 'array') {
        if (item.value.length > 0) {
          item.catchValue = {
            type: item.type,
            value: item.value
          };
        }
      } else if (item.value) {
        item.catchValue = {
          type: item.type,
          value: item.value
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

    return {
      stateData,
      isExtend,
      handleExtend,
      handleSwitch,
      handleValueChange,
      extendLevel,
      extendAll,
      disabled
    };
  }
});
</script>
<style lang="less" scoped>
.json-warper {
  & > .json-warper {
    padding-left: 40px;
  }
  .json-warper-icon-switch {
    display: inline-block;
    cursor: pointer;
    color: #71aff1;
  }
  .json-warper-icon-delete {
    display: inline-block;
    cursor: pointer;
    color: red;
  }
}
.json-node-key {
  display: inline-block;
  font-size: 14px;
  text-align: right;
  font-weight: 600;
  color: rgb(23, 154, 241);
  text-align: left;
  min-width: 20px;
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
}
.json-node-separator {
  margin: 0 4px;
  font-weight: 600;
}
.hidden-separator {
  cursor: pointer;
  margin: 0 5px;
  font-weight: 600;
  &:hover {
    color: red;
  }
}
.json-node {
  display: inline-block;
  font-size: 14px;
  min-width: 20px;
  .json-node-icon-delete {
    display: none;
  }
  .json-node-icon-switch {
    display: none;
    margin-left: 10px;
  }
  &:hover {
    .json-node-icon-switch {
      display: inline-block;
      cursor: pointer;
      color: #71aff1;
    }
    .json-node-icon-delete {
      display: inline-block;
      cursor: pointer;
      color: red;
    }
  }
}
.json-node-operate-icon {
  width: 16px;
  height: 16px;
  margin-left: 2px;
}
</style>
