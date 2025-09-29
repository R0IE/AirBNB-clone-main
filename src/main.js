import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import clickOutside from './directives/clickOutside.js';

const app = createApp(App);
app.directive('clickOutside', clickOutside);
app.use(router);
app.mount('#app');
