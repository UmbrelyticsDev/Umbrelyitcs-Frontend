import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Box, Typography } from '@material-ui/core'

const SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY

TurnstileWidget.propTypes = { onToken: PropTypes.func.isRequired }

export default function TurnstileWidget({ onToken }) {
  const ref = useRef(null)

  useEffect(() => {
    // No site key configured (dev) → backend skips Turnstile → unblock submit.
    if (!SITE_KEY) {
      onToken('dev-no-turnstile')
      return undefined
    }

    let widgetId
    const render = () => {
      if (window.turnstile && ref.current) {
        widgetId = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          callback: (token) => onToken(token),
          'error-callback': () => onToken(''),
          'expired-callback': () => onToken(''),
        })
      }
    }

    if (window.turnstile) {
      render()
    } else {
      let s = document.getElementById('cf-turnstile-script')
      if (!s) {
        s = document.createElement('script')
        s.id = 'cf-turnstile-script'
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        s.async = true
        s.defer = true
        document.body.appendChild(s)
      }
      s.addEventListener('load', render)
    }

    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [onToken])

  if (!SITE_KEY) {
    return (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Bot verification is disabled in this environment.
      </Typography>
    )
  }
  return <Box ref={ref} />
}
