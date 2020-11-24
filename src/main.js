import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//引入图标
import './assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//将富文本编辑器，注册全局可用组件
Vue.use(VueQuillEditor, /* { default global options } */)

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"

//请求拦截
axios.interceptors.request.use(config => {
  //为请求头添加token 验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component("tree-table",TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
