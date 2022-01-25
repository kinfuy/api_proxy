import { createApp, h } from 'vue';
import ContextMenuConstructor from './ContextMenu.vue';
import { getWindowSize } from '../../lib/utils';
import { PositionType, ContextMenuConfigType, ContextMenueProps, ContextMenuInstance } from './contextMenu.type';
export { PositionType, ContextMenuConfigType, ContextMenueProps, ContextMenuInstance, Menuitem } from './contextMenu.type';
const defaultConfig = { width: 160, height: 200 };
/**
 *
 * @param props 传递给组件props
 * @param position 组件位置
 * @returns instence 当前实例
 */
export const ContextMenu = function (
  props: ContextMenueProps,
  position: PositionType,
  config?: ContextMenuConfigType
): ContextMenuInstance {
  const vm = document.createElement('div');
  const app = createApp({
    render() {
      return h(ContextMenuConstructor, {
        ref: 'contextMenuRef',
        ...props,
      });
    },
  });
  const instance = app.mount(vm);
  const ContextMenuInstance = instance.$refs.contextMenuRef as ContextMenuInstance;
  sideRationalization(ContextMenuInstance.$el, position, config);
  document.body.appendChild(ContextMenuInstance.$el);
  return ContextMenuInstance;
};
/**
 * 设置样式
 * @param instence
 * @param style
 */
function setStyle(instence: HTMLElement, style: Record<string, any>) {
  for (const key in style) {
    instence.style[key as any] = style[key];
  }
}

/**
 * 计算合理位置合理
 * @param position
 * @param config
 * @returns
 */
function sideRationalization(instence: HTMLElement, position: PositionType, config?: ContextMenuConfigType) {
  const { width, height } = getWindowSize();
  const compatibleHeight = config?.height || defaultConfig.height;
  const compatibleWidth = config?.width || defaultConfig.width;
  if (position.top + compatibleHeight > height) {
    position.top -= compatibleHeight;
  }
  if (position.left + compatibleWidth > width) {
    position.left -= compatibleWidth;
  }
  setStyle(instence, {
    position: 'absolute',
    top: position.top + 'px',
    left: position.left + 'px',
  });
}
