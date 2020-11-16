import axios from 'axios'

export function request(config){
  //创建axios实例
  const instance = axios.create({
    baseURL:"http://127.0.0.1:8888/api/private/v1/",
    timeout:5000
  })

  //拦截器
  //请求拦截的作用
  instance.interceptors.request.use(config=>{
    return config
  },err => {

  })

  //响应拦截
  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    console.log(err);
  })

  //发送真正的请求
  return instance(config)
}
