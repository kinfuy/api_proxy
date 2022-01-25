import { App } from 'vue';
import IconSvg from './IconSvg.vue';

const install = (app: App) => {
  app.component(IconSvg.name, IconSvg);
};

export default install;
