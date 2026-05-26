import { ModuleRegistry } from 'ag-grid-community'
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([AllEnterpriseModule])

// Без ключа Enterprise работает в trial (дерево, группировка), но пишет в console и показывает watermark.
// Ключ: https://www.ag-grid.com/download/ → скопировать в .env (см. .env.example)
const licenseKey = import.meta.env.VITE_AG_GRID_LICENSE_KEY?.trim()
if (licenseKey) {
  LicenseManager.setLicenseKey(licenseKey)
}
