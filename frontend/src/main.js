// 1. ย้าย 2 บรรทัดนี้ขึ้นมาไว้บนสุด
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// 2. ตามด้วย import อื่นๆ
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

app.use(store);
app.use(router);

app.mount('#app');