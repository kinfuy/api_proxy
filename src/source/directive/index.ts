import { App } from 'vue';
import { Height } from './common/index';
const directives = [Height];
const insatll = (app: App) => {
  const version = Number(app.version.split('.')[0]);
  if (version < 3) {
    console.warn('This plugin requires Vue 3');
  }
  directives.forEach((item) => {
    app.directive(item.name, item.fn);
  });
};
export default insatll;
