import { config } from '~/src/config/config.js'
import { passwordGateController } from './controller.js'

const PASSWORD_PATH = '/prototype-admin/password'

/**
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const passwordGate = {
  plugin: {
    name: 'passwordGate',
    register: (server) => {
      const isEnabled = config.get('passwordGate.enabled')

      if (!isEnabled) {
        return
      }

      const configuredPassword = config.get('passwordGate.password')
      if (!configuredPassword) {
        throw new Error(
          'PASSWORD_GATE_ENABLED=true but PASSWORD_GATE_PASSWORD is missing'
        )
      }

      const cookieName = config.get('passwordGate.cookieName')
      const allowedPrefixes = [
        PASSWORD_PATH,
        '/health',
        '/favicon.ico',
        config.get('assetPath')
      ]

      server.state(cookieName, {
        ttl: config.get('passwordGate.cookieTtl'),
        isHttpOnly: true,
        isSecure: config.get('session.cookie.secure'),
        isSameSite: 'Lax',
        path: '/',
        encoding: 'iron',
        password: config.get('session.cookie.password'),
        clearInvalid: true
      })

      server.ext('onPreAuth', (request, h) => {
        const isAllowedPath = allowedPrefixes.some((prefix) =>
          request.path.startsWith(prefix)
        )

        if (isAllowedPath) {
          return h.continue
        }

        const hasValidGateCookie = request.state?.[cookieName] === 'ok'
        if (hasValidGateCookie) {
          return h.continue
        }

        const returnURL = encodeURIComponent(
          `${request.path}${request.url.search || ''}`
        )

        return h.redirect(`${PASSWORD_PATH}?returnURL=${returnURL}`).takeover()
      })

      server.route([
        {
          method: 'GET',
          path: PASSWORD_PATH,
          options: { auth: false },
          handler: passwordGateController.get
        },
        {
          method: 'POST',
          path: PASSWORD_PATH,
          options: { auth: false },
          handler: passwordGateController.post
        }
      ])
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
