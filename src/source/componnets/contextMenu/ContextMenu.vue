<template>
  <div class="contextmenu">
    <div v-for="item in menuConfig" :key="item.id" class="context-menu-item" @click.stop="headleClick(item)">
      <Render v-if="item.render" :render="item.render"></Render>
      <template v-else>
        <IconSvg :name="item.icon"></IconSvg>
        <span class="menu-text">{{ item.name }}</span>
        <IconSvg v-if="item.children" fix-class="fix-class" name="week-arrow-right-copy-copy"></IconSvg>
        <div v-if="item.children" class="children-menu">
          <ContextMenu :menu-config="item.children" :onClick="onClick"></ContextMenu>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Menuitem, ContextMenueProps, StyleParams } from './contextMenu.type';
import IconSvg from './../Icon/IconSvg.vue';
import Render from './../Render/Render';
export default defineComponent({
  name: 'ContextMenu',
  components: { IconSvg, Render },
  props: {
    menuConfig: {
      type: Array as PropType<Array<Menuitem>>,
      required: true,
    },
    onClick: {
      type: Function as PropType<(code: any) => void>,
      required: true,
    },
  },
  setup(props) {
    const headleClick = (item: Menuitem) => {
      if (item.key && props.onClick) {
        props.onClick(item.key);
      }
    };
    return {
      headleClick,
    };
  },
});
</script>

<style lang="less" scoped>
.contextmenu {
  padding: 2px 0px;
  min-width: 160px;
  background: rgb(255, 255, 255);
  transition: opacity 0s ease 0s, transform 0.2s ease-in-out 0s;
  border-radius: 4px;
  transform-origin: 0px 0px;
  box-shadow: #ccc 0px 2px 16px 0px;
  .context-menu-item {
    position: relative;
    min-width: 160px;
    padding: 10px;
    cursor: pointer;
    &:hover {
      background-color: #f4f4f4;
      > .children-menu {
        display: block;
      }
    }
    .children-menu {
      display: none;
      position: absolute;
      top: 0;
      left: 100%;
      box-shadow: #ccc 0px 2px 16px 0px;
    }
    .fix-class {
      position: absolute;
      right: 10px;
    }
    .menu-text {
      margin-left: 10px;
    }
  }
}
</style>
