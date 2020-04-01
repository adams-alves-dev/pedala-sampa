import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    },
    {
      path: '/club/:id',
      name: 'club',
      component: () => import('./views/Club.vue')
    }
    // { path: "*", component: PageNotFound } fazer pagina notfound
  ]
})
