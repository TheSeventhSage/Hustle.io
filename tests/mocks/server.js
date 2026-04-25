import { setupServer } from 'msw/node'
import { authHandlers }    from './handlers/auth.handlers.js'
import { hustlesHandlers }  from './handlers/hustles.handlers.js'
import { walletHandlers }   from './handlers/wallet.handlers.js'

export const server = setupServer(
  ...authHandlers,
  ...hustlesHandlers,
  ...walletHandlers,
)
