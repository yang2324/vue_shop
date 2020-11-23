import Vue from 'vue'
import VueRouter from 'vue-router'


import Login from "../components/Login";
import Home from "../views/home/Home";
import Welcome from "../views/home/childComps/Welcome";
import User from "../views/user/User";
import Rights from "../views/power/Rights";
import Roles from "../views/power/Roles";
import Cate from "../views/goods/Cate";
import Params from "../views/goods/Params";
import Goods from "../views/goods/Goods";

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
      {path: '/goods', component: Goods}
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
