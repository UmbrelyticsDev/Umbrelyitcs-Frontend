import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'

// Teachers who haven't completed the first-login teaching profile are sent to
// the onboarding screen before they can use the dashboard. Everyone else passes
// straight through. onboarded comes from the login payload (0 = not done).
OnboardingGuard.propTypes = { children: PropTypes.node }

export default function OnboardingGuard({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const isTeacher = user_type === 4 || user_type === 5

  if (isTeacher && Number(user?.onboarded) === 0) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}
