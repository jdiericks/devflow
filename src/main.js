import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './index.css'
import './style.css'
import App from './App.vue'
import Dashboard from './components/Dashboard.vue'
import PageEditor from './components/PageEditor.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/page/:id', component: PageEditor, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
