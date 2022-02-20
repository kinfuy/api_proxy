import { App } from 'vue';
import JsonEditor from './JsonEditor.vue';
import './components/Icon/iconfont.js';
const install = (app: App) => {
  app.component('JsonEditor', JsonEditor);
  return app;
};
export default {
  install
};
