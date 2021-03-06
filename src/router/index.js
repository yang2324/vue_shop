import Vue from 'vue'
import VueRouter from 'vue-router'

//懒加载
const Login = () => import('components/Login')
const Home = () => import('views/home/Home')
const Welcome = () => import('views/home/childComps/Welcome')
const User = () => import('views/user/User')
const Rights = () => import('views/power/Rights')
const Roles = () => import('views/power/Roles')
const Cate = () => import('views/goods/Cate')
const Params = () => import('views/goods/Params')
const Goods = () => import('views/goods/Goods')
const Add = () => import('views/goods/Add')
const Order = () => import('views/order/Order')
const Report = () => import('views/report/Report')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {path: '/welcome', component: Welcome},
      {path: '/users', component: User},
      {path: '/rights', component: Rights},
      {path: '/roles', component: Roles},
      {path: '/categories', component: Cate},
      {path: '/params', component: Params},
      {path: '/goods', component: Goods},
      {path: '/goods/add', component: Add},
      {path: '/orders', component: Order},
      {path: '/reports', component: Report},
    ]
  }
]

const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //form 代表从哪个路径跳转而来
  //next() 函数  放行    next("/") 强制跳转
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next()
})

export default router
