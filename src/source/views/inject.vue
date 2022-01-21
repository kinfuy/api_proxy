<template>
  <div class="inject-view">
    <div class="drag-content">
      <span>最小化</span>
      <span>退出</span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Inject',
});
</script>
<style lang="less" scoped>
.drag-content {
  height: 50px;
  cursor: move;
}
</style>
