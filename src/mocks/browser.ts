import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { realtimeHandlers } from './socket'

export const worker = setupWorker(...handlers, ...realtimeHandlers)
