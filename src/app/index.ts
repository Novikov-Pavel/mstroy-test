import { createApp } from 'vue'
import { setupProviders } from '@app/providers'
import '@app/styles/global.css'
import App from './index.vue'

export const app = createApp(App)
setupProviders(app)
