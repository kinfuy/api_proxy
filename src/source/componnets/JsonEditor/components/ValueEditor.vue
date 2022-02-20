<template>
  <div class="value-editor" spellcheck="false" @click="handleClick">
    <span
      ref="valueEditorRef"
      :class="['value-editor-text', { 'value-editor-input': isEdit }]"
      @blur="handleBlur"
      @input="handleInput"
      @keydown.enter="handleEnter"
      >{{ `"${value}"` }}
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, nextTick } from 'vue';
export default defineComponent({
  name: 'ValueEditor',
  props: {
    value: {
      type: [String, Number, Boolean],
      required: true
    },
    disabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:value', 'change', 'focus', 'blur'],
  setup(props, { emit }) {
    const valueEditorRef = ref<HTMLInputElement | null>(null);
    const stateValue = ref<string | number | boolean>('');
    const isEdit = ref(false);
    watch(
      () => props.value,
      val => {
        stateValue.value = val;
      },
      {
        immediate: true
      }
    );
    const handleClick = () => {
      if (!props.disabled) {
        isEdit.value = true;
        nextTick(() => {
          if (valueEditorRef.value) {
            valueEditorRef.value.focus();
            emit('focus');
          }
        });
        stateValue.value = props.value;
      } else {
        isEdit.value = false;
      }
    };

    const edited = ref(false);
    const handleBlur = () => {
      isEdit.value = false;
      if (valueEditorRef.value && edited.value) {
        emit('update:value', valueEditorRef.value.innerText.replace(/^"|"$/g, ''));
        emit('change', valueEditorRef.value.innerText.replace(/^"|"$/g, ''));
      }
      emit('blur');
    };
    const handleInput = () => {
      edited.value = true;
      // if (valueEditorRef.value) {
      //   emit('update:value', valueEditorRef.value.innerText);
      //   emit('change', valueEditorRef.value.innerText);
      // }
    };
    const handleEnter = (e: KeyboardEvent) => {
      e.preventDefault();
    };
    return {
      isEdit,
      stateValue,
      handleClick,
      handleBlur,
      handleEnter,
      valueEditorRef,
      handleInput
    };
  }
});
</script>
<style lang="less" scoped>
.value-editor {
  display: inline-block;
  height: 100%;

  .value-editor-text {
    display: inline-block;
    outline: none;
    box-sizing: border-box;
    border: none;
    min-width: 20px;
    height: 100%;
  }
  .value-editor-input {
    -webkit-user-modify: read-write-plaintext-only; // 实现div 可编辑状态仅能输入纯文本
  }
}
</style>
