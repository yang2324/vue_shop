import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//引入图标
import './assets/fonts/iconfont.css'

import axios from 'axios'

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"

//请求拦截
axios.interceptors.request.use(config => {
  //为请求头添加token 验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
