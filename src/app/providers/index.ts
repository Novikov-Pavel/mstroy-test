import type { App } from 'vue'
import './ag-grid'
import { router } from './router'

export function setupProviders(app: App): void {
  app.use(router)
}
