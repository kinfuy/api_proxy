import IconSvg from './IconSvg.vue';
import type { App } from 'vue';

const install = (app: App) => {
  app.component(IconSvg.name, IconSvg);
};

export default install;
