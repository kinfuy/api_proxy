<template>
  <svg :class="['svg-icon', fixClass]" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'IconSvg',
  props: {
    name: {
      type: String,
      required: true,
    },
    fixClass: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    let iconName = computed(() => {
      return `#${props.name}`;
    });
    return {
      iconName,
    };
  },
});
</script>

<style lang="less" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  font-size: 20px;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  pointer-events: none;
}
.cursor {
  cursor: pointer;
}
.margin {
  margin: 0 8px;
}
</style>
