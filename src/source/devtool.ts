// 只能访问 devtools、extension、runtime等部分API
import 'babel-polyfill';
import { createDevtoolsanels } from './../libs/chrome';
createDevtoolsanels();
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'style-loader!css-loader!element-plus/dist/index.css';
import router from './router/devtool';
import App from './App.vue';
import IconSvg from './componnets/Icon';
import './assets/icons/iconfont.js';
import './componnets/JsonEditor/components/Icon/iconfont.js';
import CommonDirective from './directive';
const app = createApp(App);

app.use(ElementPlus);
app.use(CommonDirective);
app.use(IconSvg);
app.use(router);
app.mount('#devtool-app');
