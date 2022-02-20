<template>
  <SubJsonNode :json="stateData" :currect-level="1"></SubJsonNode>
</template>
<script lang="ts">
import { defineComponent, provide, ref, watch, toRef, PropType } from 'vue';
import { deepAnalysisJson, deepDeleteJson, deepReductionJson, deepUpdataJson } from './utils';
import SubJsonNode from './components/SubJsonNode.vue';
export default defineComponent({
  name: 'JsonEditor',
  components: { SubJsonNode },
  props: {
    json: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    extendAll: {
      type: Boolean,
      default: false
    },
    extendLevel: {
      type: Number,
      default: 0
    },
    config: {
      type: Object as PropType<JsonEditorConfig>,
      default: () => {}
    }
  },
  emits: ['update:value', 'change', 'extend', 'delete'],
  setup(props, { emit }) {
    const stateData = ref<JsonItem>({
      id: 'root',
      key: '',
      value: '',
      type: 'object',
      root: true
    });

    const extendCatchKey = ref<ExtendCatchKeyItem[]>([]);

    watch(
      () => props.json,
      (val: string) => {
        if (val) stateData.value.value = deepAnalysisJson(JSON.parse(val));
      },
      {
        immediate: true,
        deep: true
      }
    );

    // json change
    const handleChange = async (name: 'change' | 'extend' | 'delete', value: any) => {
      if (!value.root) {
        await deepUpdataJson(stateData.value, value.id, value.key, value.value);
      }
      const originData = await deepReductionJson(stateData.value.value);
      await emit(name, JSON.stringify(originData));
    };

    // 展开折叠
    const handleExtend = (value: { key: string | number; level: number; isExtend: boolean }) => {
      const exist = extendCatchKey.value.some(x => {
        return value.key === x.key && value.level === x.level;
      });
      if (exist) {
        if (!value.isExtend) {
          for (let i = 0; i < extendCatchKey.value.length; i++) {
            if (value.key === extendCatchKey.value[i].key && value.level === extendCatchKey.value[i].level) {
              extendCatchKey.value.splice(i, 1);
              i--;
            }
          }
        }
      } else if (value.isExtend) {
        extendCatchKey.value.push({ key: value.key, level: value.level });
      }
      emit('extend', extendCatchKey.value);
    };

    const handleAttrDelete = async (name: 'change' | 'extend' | 'delete', value: any) => {
      await deepDeleteJson(stateData.value, value.id);
      const originData = await deepReductionJson(stateData.value.value);
      await emit('change', JSON.stringify(originData));
      emit('delete', value);
    };
    const eventTrigger = (name: 'change' | 'extend' | 'delete', value: any) => {
      if (name === 'change') handleChange(name, value);
      if (name === 'delete') handleAttrDelete(name, value);
      if (name === 'extend') handleExtend(value);
    };
    provide('eventTrigger', eventTrigger);
    provide('JsonEditorContext', {
      extendCatchKey: extendCatchKey,
      disabled: toRef(props, 'disabled'),
      extendAll: toRef(props, 'extendAll'),
      extendLevel: toRef(props, 'extendLevel'),
      jsonConfig: toRef(props, 'config')
    });
    return {
      stateData,
      extendCatchKey
    };
  }
});
</script>
<style lang="less" scoped></style>
