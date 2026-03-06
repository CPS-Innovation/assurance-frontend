import { config } from '~/src/config/config.js'

const PASSWORD_GATE_VIEW = 'password-gate/views/index'
const PASSWORD_PATH = '/prototype-admin/password'

function normaliseReturnUrl(returnURL) {
  if (!returnURL || typeof returnURL !== 'string') {
    return '/'
  }

  // Only allow relative paths to prevent open redirects
  if (!returnURL.startsWith('/')) {
    return '/'
  }

  if (returnURL.startsWith(PASSWORD_PATH)) {
    return '/'
  }

  return returnURL
}

export const passwordGateController = {
  get: (request, h) => {
    const returnURL = normaliseReturnUrl(request.query?.returnURL)

    return h.view(PASSWORD_GATE_VIEW, {
      pageTitle: 'Sign in',
      returnURL,
      hasError: false
    })
  },

  post: (request, h) => {
    const enteredPassword = request.payload?.password
    const configuredPassword = config.get('passwordGate.password')
    const returnURL = normaliseReturnUrl(request.payload?.returnURL)

    if (enteredPassword && enteredPassword === configuredPassword) {
      h.state(config.get('passwordGate.cookieName'), 'ok')
      return h.redirect(returnURL)
    }

    return h.view(PASSWORD_GATE_VIEW, {
      pageTitle: 'Sign in',
      returnURL,
      hasError: true,
      errorMessage: 'Enter the correct password'
    })
  }
}
