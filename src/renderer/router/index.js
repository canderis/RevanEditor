import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Router)
Vue.use(ElementUI)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
        path: '/GameSelection',
        name: 'game-selection',
        component: require('@/components/GameSelection').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
