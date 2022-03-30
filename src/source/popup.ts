// 只能访问 devtools、extension、runtime等部分API
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'style-loader!css-loader!element-plus/dist/index.css';
import router from './router/popup';
import App from './App.vue';
const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.mount('#popup-app');
