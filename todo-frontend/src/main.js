import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
import router from './router'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import './css/app.scss'

createApp(App)
  .use(Quasar)
  .use(router)
  .mount('#app')
