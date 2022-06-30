// 只能访问 devtools、extension、runtime等部分API
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { SimpleJson } from 'vue-simple-json';
import { createDevtoolsanels } from '../../libs/chrome';

import router from '../router/devtool';
import IconSvg from '../componnets/Icon';
import CommonDirective from '../directive';
import App from '../App.vue';

import 'element-plus/dist/index.css';
import 'vue-simple-json/style/index.css';
createDevtoolsanels();
const app = createApp(App);

app.use(SimpleJson);
app.use(ElementPlus);
app.use(CommonDirective);
app.use(IconSvg);
app.use(router);
app.mount('#devtool-app');
