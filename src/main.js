
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入element-plus样式文件
import 'bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
