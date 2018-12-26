import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from './components/Login'
import HomePage from './components/Home'

Vue.use(VueRouter)

var requireAuth = (to, from, next) => {
  if (window.localStorage.user) {
    return next()
  } else {
    return next({path: '/login'})
  }
}

const router = new VueRouter({
  mode: 'history',
  routes: [
    {path: '/', name: 'Home', component: HomePage, beforeEnter: requireAuth},
    {path: '/login', name: 'Login', component: LoginPage},
    {path: '*', redirect: '/'}
  ]
})

export default router
