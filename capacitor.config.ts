import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.smartmoney.ai',
  appName: 'SmartMoney AI',
  webDir: 'dist',
  backgroundColor: '#0d0e10',
  android: { backgroundColor: '#0d0e10' },
  plugins: { CapacitorHttp: { enabled: true } },
}
export default config
