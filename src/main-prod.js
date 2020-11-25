import Vue from 'vue'
import App from './App.vue'
import router from './router'
//引入图标
import './assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式

//导入NProgress对应的js和css
// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

//将富文本编辑器，注册全局可用组件
Vue.use(VueQuillEditor, /* { default global options } */)

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"

//请求拦截
axios.interceptors.request.use(config => {
  //为请求头添加token 验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem("token")
  //NProgress.start();
  return config
})
//响应拦截器
axios.interceptors.request.use(config => {
  //NProgress.done();
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component("tree-table", TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
