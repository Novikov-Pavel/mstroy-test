import { createApp } from 'vue'
import { router } from './providers/router'
import './providers/ag-grid'
import '@app/styles/global.css'
import App from './index.vue'

export const app = createApp(App)
app.use(router)