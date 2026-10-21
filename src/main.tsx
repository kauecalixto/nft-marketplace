import './index.css'

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
  const { mountApp } = await import('./app')
  mountApp(document.getElementById('root')!)
}
void bootstrap()
