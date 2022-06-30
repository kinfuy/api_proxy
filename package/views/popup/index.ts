import { createApp } from 'vue';
import App from '../App.vue';
import { router } from '../router/popup';

const app = createApp(App);
app.use(router);
app.mount('#popup-app');
